from google.cloud import bigquery
from flask import jsonify, request, make_response
from datetime import datetime, timedelta
import pandas as pd

def add_cors_headers(response):
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
  response.headers['Access-Control-Allow-Headers'] = 'Authorization'
  return response

def replace_name(values):
    name_map = {
        "Taipei": "台北市",
        "Newtaipei": "新北市",
        "Taoyuan": "桃園市",
        "Hsinchu": "新竹市",
        "Hsinchu_Country": "新竹縣",
        "HsinchuScience": "竹科",
        "Miaoli": "苗栗縣",
        "Taichung": "台中市",
        "Chiayi": "嘉義市",
        "Chiayi_Country": "嘉義縣",
        "Tainan": "台南市",
        "Kaohsiung": "高雄市",
        "Pingtung": "屏東縣",
        "Taitung": "台東縣"
    }
    new_values = []
    for value in values:
        if value in name_map:
            new_values.append(name_map[value])
        else:
            new_values.append(value)
    return new_values



def get_data(request):

  if request.method == 'OPTIONS':
    response = make_response()
    response = add_cors_headers(response)
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization'
    return response


  request_json = request.get_json(silent=True)

  if not request_json:
    raise RuntimeError('Error')
  client = bigquery.Client()
  dataset_id = request_json.get('dataset_id')
  if not dataset_id:
    raise RuntimeError('Error')
  dataset_ref = client.dataset(dataset_id)
  
  table_id = request_json.get('table_id')
  if not table_id:
    raise RuntimeError('Error')
  table_ref = dataset_ref.table(table_id)

  query = f"SELECT * FROM `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`"

#################################################################################################    
#################################################################################################


  if table_ref.table_id == 'station':
    query = (
      f"""SELECT '2.0' as sys, (case when city_id in (5001,5081) then '台北市' when city_id = 5002 then '新北市' when city_id = 5003 then '桃園市' when city_id = 5004 then '新竹市' when city_id = 5082 then '竹科' when city_id = 5005 then '新竹縣' when city_id = 5007 then '苗栗縣' when city_id = 5006 then '台中市' when city_id = 5010 then '嘉義市' when city_id = 5011 then '嘉義縣' when city_id = 5013 then '台南市' when city_id = 5012 then '高雄市' when city_id = 5014 then '屏東縣' end) as city, s_no, s_name_tw
      FROM `yb2.station`
      where city_id != 5099
      union all
      SELECT '1.0' sys, (case when SxPSNo between 1001 and 1900 then '新北市' when SxPSNo between 2001 and 2900 then '桃園市' when SxPSNo between 6601 and 6990 then '苗栗縣' end) as city, SxPSNo as s_no, SxPSName as s_name_tw
      FROM `data_center.SPARA`
      WHERE (SxPSNo between 1001 and 1900 or SxPSNo between 2001 and 2900 or SxPSNo between 6601 and 6990)
      and SxPSName not like '@%'
      order by sys, city, s_no
      """
    )
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('daily_turnover_rank','daily_turnover_rank_real'):
    date = request_json.get('date')
    city = request_json.get('city',[])
    if 'all' not in city :
      if isinstance(city, list):
        city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      else:
        raise RuntimeError('Error')
    else:
      city_clause = 'city is not null'
    
    query += (
      f""" WHERE date = '{date}' and {city_clause} order by turnover desc"""
    )


  if table_ref.table_id in ('daily_summary_Taiwan'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    if 'all' not in city :
      if isinstance(city, list):
        city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      else:
        raise RuntimeError('Error')
    else:
      city_clause = 'city is not null'

    query += (
      f""" WHERE date between '{begin_date}' and '{end_date}' and {city_clause} order by date,rank"""
    )

  
  if table_ref.table_id == 'monthly_operation_report':
    date = request_json.get('date')
    query += (
      f""" WHERE month = concat(substr('{date}',1,4),'年',substr('{date}',6,2),'月') order by rank"""
    )


  if table_ref.table_id in ('arrearsall_report1','arrearsall_report2'):
    year = request_json.get('year')
    if year is not None:
      city = request_json.get('city')
      query += (
        f""" WHERE NYear = {year} and city_new = '{city}' order by NYear, city, amt_range"""
      )
    else:
      city = request_json.get('city')
      query += (
        f""" WHERE city_new = '{city}' and amt_range = 20 order by NYear, city, amt_range"""
      )

  
  if table_ref.table_id in ('tan_tan_1','tan_tan_2'):
    if table_ref.table_id == 'tan_tan_1':
      date = request_json.get('date')
      query += (f""" where date = '{date}' order by rank, rank1""")
    else:
      city = request_json.get('city',[])
      date = request_json.get('date')
      if isinstance(city, list):
        city_clause = 'rank IN ({})'.format(','.join(str(i) for i in city))
      else:
        raise RuntimeError('Error')
      query += (f""" where date = '{date}' and {city_clause} order by rank, times""")

  
  if table_ref.table_id == 'battery_analysis':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city')
      
    query = (
      f""" select city, item, hr, times
      from(
        select rank, city, item, hr, sum(case when times is null then 0 else times end) as times
        from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
        where date between '{begin_date}' and '{end_date}'
        and city = '{city}'
        group by 1,2,3,4
        order by city, rank, hr
      )"""
    )
    rows = client.query(query).result()
    data = []
    data.append(['city','item','hr','times'])
    for row in rows:
      data.append(list(row.values()))

    new_table = [['縣市','項目','00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']]
    data_dict = {}
    for row in data[1:]:
        city, item, hr, times = row
        if (city, item) not in data_dict:
            data_dict[(city, item)] = {}
        data_dict[(city, item)][hr] = int(times)

    for (city, item), data1 in data_dict.items():
        new_row = [city, item]
        for hr in new_table[0][2:]:
            new_row.append(data1.get(hr, 0))
        new_table.append(new_row)
      
    response = make_response(jsonify(new_table))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'rent_minute_report2':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city')
    item = request_json.get('item', [])
    if isinstance(item, list):
      item_clause = 'same_station IN ({})'.format(','.join(f"'{i.encode('utf-8').decode('utf-8')}'" for i in item))
    else:
      raise RuntimeError('Error')
    query = (
      f"""SELECT city, SxPSArea, same_station, rate_info, rent_minute, rank, sum(times) as times
      FROM `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
      where date between '{begin_date}' and '{end_date}'
      and city = '{city}'
      and {item_clause}
      group by 1,2,3,4,5,6
      order by city,SxPSArea,same_station,rate_info,rank"""
    )
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'OD_rank':
    date = request_json.get('date')
    item = request_json.get('item',[])
    city = request_json.get('city',[])
    if isinstance(item, list) and isinstance(city, list):
      week_clause = 'weekday IN ({})'.format(','.join(f"'{i.encode('utf-8').decode('utf-8')}'" for i in item))
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')
    
    query += (
      f""" WHERE date = '{date}'
      and {week_clause}
      and {city_clause}
      order by city, rank"""
    )
  

  if table_ref.table_id in ('rent_return_rank_top','rent_return_rank_bottom'):
    date = request_json.get('date')
    item = request_json.get('item',[])
    city = request_json.get('city',[])
    if isinstance(item, list) and isinstance(city, list):
      item_clause = 'rent_return IN ({})'.format(','.join(f"'{i.encode('utf-8').decode('utf-8')}'" for i in item))
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')
    
    query += (
      f""" WHERE date = '{date}'
      and {item_clause}
      and {city_clause}
      order by city, rank"""
    )
  

  if table_ref.table_id == 'weekly_rank':
    city = request_json.get('city',[])
    item = request_json.get('item',[])
    date = request_json.get('date')
    if isinstance(city, list) and isinstance(item, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      item_clause = 'item IN ({})'.format(','.join(f"'{i.encode('utf-8').decode('utf-8')}'" for i in item))
    else:
      raise RuntimeError('Error')

    query += (
      f""" WHERE date = '{date}'
      and {city_clause}
      and {item_clause}
      order by item, city, rank_this_week"""
    )


  if table_ref.table_id in ('monthly_report_query1'):
    date = request_json.get('date')
    city = request_json.get('city')
    query = (
      f"""SELECT a.date, a.city, a.rank, a.item, b.year1, a.month1, a.month2, a.month3, a.month4, a.month5, a.month6, a.month7, a.month8, a.month9, a.month10, a.month11, a.month12, b.year2
      FROM `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}` as a
      left join `report.yearly_report_query1` as b
      on a.date = b.date and a.city = b.city and a.rank = b.rank
      where a.date = '{date}' and a.city = '{city}'
      order by rank"""
    )
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response
  

  if table_ref.table_id in ('monthly_report_query2'):
    date = request_json.get('date')
    city = request_json.get('city')
    query = (
      f"""SELECT a.date, a.city, a.rank, a.item, b.year1, a.month1, a.month2, a.month3, a.month4, a.month5, a.month6, a.month7, a.month8, a.month9, a.month10, a.month11, a.month12, b.year2
      FROM `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}` as a
      left join `report.yearly_report_query2` as b
      on a.date = b.date and a.city = b.city and a.rank = b.rank
      where a.date = '{date}' and a.city = '{city}'
      order by rank"""
    )
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('monthly_report_query2E'):
    date = request_json.get('date')
    city = request_json.get('city')
    query += (f""" where date = '{date}' and city = '{city}' order by rank""")


  if table_ref.table_id in ('daily_report_query1','daily_report_query2'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    city_length = len(city)
    if city_length != 0:
      if isinstance(city, list):
        city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      else:
        raise RuntimeError('Error')
    else:
      return []
    query += f" WHERE date BETWEEN '{begin_date}' AND '{end_date}' AND {city_clause} ORDER BY date, city"
    
    rows = client.query(query).result()
    data = []
    data.append(['date','city','日期','星期','天氣','日雨量(亳米)','溫度','場站資訊','新增站數','總啟用站數','新增車位數','總停車位','合約車輛數','車位比','租借資訊','當日租借車次','當月租借車次','當年租借車次(千次)','累積租借車次(千次)','周轉率','收入資訊','預估政府補助金額','其他租賃收入','租賃收入合計','每趟次平均消費金額','妥善率資訊','車輛可動率','Kiosk妥善率','網路連通率','停車架服務時數妥善率','上線車輛妥善率','自行車輛上線率','票卡資訊','轉乘使用次數','月票使用次數','敬老使用次數','轉乘使用卡片數','月票使用卡片數','敬老使用卡片數','註冊票卡淨刪減數','註冊票卡淨增加數','WEB','KIOSK','APP','累計有效票卡數','WEB','KIOSK','APP','新增註冊會員數','WEB','KIOSK','APP','累計註冊會員數','WEB','KIOSK','APP','當日租借車次','電子票證','悠遊卡','一卡通','掃碼租車','單次租車','LINE Pay','悠遊付','註冊票卡淨增加數','電子票證','悠遊卡','一卡通','掃碼租車','LINE Pay','悠遊付','租借資訊','甲租乙還(次數)','甲租乙還(%比率)','各時段使用資訊','0-5分鐘(次數)','0-5分鐘(%比率)','5-15分鐘(次數)','5-15分鐘(%比率)','15-30分鐘(次數)','15-30分鐘(%比率)','30-60分鐘(次數)','30-60分鐘(%比率)','60-120分鐘(次數)','60-120分鐘(%比率)','120-240分鐘(次數)','120-240分鐘(%比率)','240-480分鐘(次數)','240-480分鐘(%比率)','480分鐘以上(次數)','480分鐘以上(%比率)','租賃收入明細','悠遊卡','一卡通','信用卡','掃碼租車','單次租車','LINE Pay','悠遊付','租賃收入合計'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('daily_report_query2E'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    city_length = len(city)
    if city_length != 0:
      if isinstance(city, list):
        city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      else:
        raise RuntimeError('Error')
    else:
      return []
    query += f" WHERE date BETWEEN '{begin_date}' AND '{end_date}' AND {city_clause} ORDER BY date, city"
    
    rows = client.query(query).result()
    data = []
    data.append(['date','city','日期','星期','天氣','雨量','溫度','營運資訊','上線車輛數','租借資訊','當日租借車次','當月租借車次','當年租借車次(千次)','累積租借車次(千次)','周轉率','收入資訊','預估政府補助金額','其他租賃收入','租賃收入合計','每趟次平均消費金額','當日租借車次','電子票證','悠遊卡','一卡通','掃碼租車','單次租車','LINE Pay','悠遊付','租借資訊','甲租乙還(次數)','甲租乙還(%比率)','轉乘使用次數','月票使用次數','敬老使用次數','轉乘使用卡片數','月票使用卡片數','敬老使用卡片數','租賃時間使用資訊','平均租賃時間','0-5分鐘(次數)','0-5分鐘(%比率)','5-15分鐘(次數)','5-15分鐘(%比率)','15-30分鐘(次數)','15-30分鐘(%比率)','30-60分鐘(次數)','30-60分鐘(%比率)','60-120分鐘(次數)','60-120分鐘(%比率)','120-240分鐘(次數)','120-240分鐘(%比率)','240-480分鐘(次數)','240-480分鐘(%比率)','480分鐘以上(次數)','480分鐘以上(%比率)','租賃收入明細','悠遊卡','一卡通','信用卡','掃碼租車','單次租車','LINE Pay','悠遊付','租賃收入合計','維護管理','更換電池數','電池低於50%派工次數','電池低於50%完成派工數','電池低於50%派工達成率','電池低於20%以下禁用發生次數','電池低於5%以下發生次數','調度管理','6時重點場站車輛配置率','16時重點場站車輛配置率','騎乘距離分析','總平均騎乘公里數','1公里以下','1-3公里','3-5公里','5-10公里','10公里以上'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('daily_report_maintain_query1'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city')
    query += f" WHERE date BETWEEN '{begin_date}' AND '{end_date}' AND city = '{city}' ORDER BY date" 

    rows = client.query(query).result()
    data = []
    data.append(['date','city','日期','星期','天氣','日雨量（亳米）','溫度','使用次數','每萬次使用次數','周轉率','合約標準數','達成數','日達成率','1分鐘以上無位可還總分鐘數','站數','日達成率(無位可還)','5分鐘以上無位可還次數','10分鐘以上無位可還次數','20分鐘以上無位可還次數','10分鐘無位可還比率','10分鐘無位可還每萬次發生率','1分鐘以上無車可借總分鐘數','站數','日達成率(無車可借)','A級場站10分鐘以上無車可借次數','B級場站10分鐘以上無車可借次數','C級場站10分鐘以上無車可借次數','無車綁車10分鐘以上次數(全時段)','無車綁車10分鐘以上次數(06-23)','無車綁車1分鐘總分鐘數(全時段)','10分鐘無車可借比率','10分鐘無車可借每萬次發生率'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('daily_report_maintain_query2'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city')
    query += f" WHERE date BETWEEN '{begin_date}' AND '{end_date}' AND city = '{city}' ORDER BY date" 

    rows = client.query(query).result()
    data = []
    data.append(['date','city','日期','星期','天氣','日雨量（亳米）','溫度','使用次數','每萬次使用次數','周轉率','合約標準數','達成數','日達成率','1分鐘以上無位可還總分鐘數','站數','日達成率(無位可還)','10分鐘以上無位可還次數','10分鐘無位可還比率','10分鐘爆站每萬次發生率','1分鐘以上無車可借總分鐘數','站數','日達成率(無車可借)','A級場站10分鐘以上無車可借次數','B級場站20分鐘以上無車可借次數','C級場站30分鐘以上無車可借次數','無車綁車10分鐘以上次數(全時段)','無車綁車10分鐘以上次數(06-23)','無車綁車1分鐘總分鐘數(全時段)','10分鐘無車可借比率','10分鐘無車可借每萬次發生率'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('monthly_report1'):
    date = request_json.get('date')
    query += f" WHERE date = '{date}' order by rank"

    rows = client.query(query).result()
    data = []
    data.append(['rank','date','項目','營運站數','合約車數','本月使用次數','累計使用次數(千次)','最高使用次數','最低使用次數','平均周轉率','最高周轉率','最低周轉率','新增會員數','註冊管道-KIOSK','註冊管道-官網','註冊管道-APP','歷史累計會員數','新增總票證數','悠遊卡','一卡通','歷史累計總票證數','悠遊卡','一卡通','單次租車次數'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('monthly_report2_E'):
    date = request_json.get('date')
    query += f" WHERE date = '{date}' order by rank" 

    rows = client.query(query).result()
    data = []
    data.append(['rank','date','項目','營運站數','合約車數','本月使用次數','累計使用次數(千次)','最高使用次數','最低使用次數','平均周轉率','最高周轉率','最低周轉率','新增會員數','註冊管道-KIOSK','註冊管道-官網','註冊管道-APP','歷史累計會員數','新增總票證數','悠遊卡','一卡通','歷史累計總票證數','悠遊卡','一卡通','單次租車次數','票證借車','掃碼借車'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'daily_empty_full':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    status = request_json.get('status',[])
    station = request_json.get('station',[])
    if isinstance(city, list) and isinstance(status, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      status_clause = 'status IN ({})'.format(','.join(f"'{s.encode('utf-8').decode('utf-8')}'" for s in status))
    else:
      raise RuntimeError('Error')

    if 'all' not in station:
      if isinstance(station, list):
        station_clause = 's_no IN ({})'.format(','.join(f"{x}" for x in station))
      else:
        raise RuntimeError('Error')
    else:
      station_clause = 's_no is not null'

    query += (
      f""" WHERE date between '{begin_date}' and '{end_date}'
      and {city_clause}
      and {status_clause}
      and {station_clause}
      and item = '分鐘'
      order by date, s_no, status"""
    )


  if table_ref.table_id == 'weekly_empty_full_station':
    date = request_json.get('date')
    city = request_json.get('city',[])
    status = request_json.get('status',[])
    station = request_json.get('station',[])
    item = request_json.get('item')
    if isinstance(city, list) and isinstance(status, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      status_clause = 'status IN ({})'.format(','.join(f"'{s.encode('utf-8').decode('utf-8')}'" for s in status))
    else:
      raise RuntimeError('Error')

    if 'all' not in station:
      if isinstance(station, list):
        station_clause = 's_no IN ({})'.format(','.join(f"{x}" for x in station))
      else:
        raise RuntimeError('Error')
    else:
      station_clause = 's_no is not null'

    query += (
      f""" WHERE date = '{date}'
      and {city_clause}
      and {status_clause}
      and {station_clause}
      and label = '{item}'
      order by date, s_no, status"""
    )


  if table_ref.table_id == 'monthly_empty_full_station':
    date = request_json.get('date')
    city = request_json.get('city',[])
    status = request_json.get('status',[])
    station = request_json.get('station',[])
    item = request_json.get('item')
    if isinstance(city, list) and isinstance(status, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      status_clause = 'status IN ({})'.format(','.join(f"'{s.encode('utf-8').decode('utf-8')}'" for s in status))
    else:
      raise RuntimeError('Error')

    if 'all' not in station:
      if isinstance(station, list):
        station_clause = 's_no IN ({})'.format(','.join(f"{x}" for x in station))
      else:
        raise RuntimeError('Error')
    else:
      station_clause = 's_no is not null'

    query += (
      f""" WHERE date = '{date}'
      and {city_clause}
      and {status_clause}
      and {station_clause}
      and label = '{item}'
      order by date, s_no, status"""
    )


  if table_ref.table_id in ('Subsidy','monthly_pass'):
    date = request_json.get('date')
    query += f" WHERE date = '{date}' ORDER BY rank"


  if table_ref.table_id in ('monthly_report_ride_INSUR','monthly_report_INSUR','monthly_report_MEBER','monthly_report_email_INSUR_count'):
    date = request_json.get('date',[])
    city = request_json.get('city',[])
    if isinstance(date, list) and isinstance(city, list):
      date_clause = 'date IN ({})'.format(','.join(str(d) for d in date))
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')

    query += (
      f""" WHERE {date_clause}
      and {city_clause}
      order by date desc, rank"""
    )
  

  if table_ref.table_id in ('weekly_report_ride_INSUR'):
    date = request_json.get('date',[])
    city = request_json.get('city',[])
    if isinstance(date, list) and isinstance(city, list):
      date_clause = 'date IN ({})'.format(','.join(f"'{d.encode('utf-8').decode('utf-8')}'" for d in date))
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')

    query += (
      f""" WHERE {date_clause}
      and {city_clause}
      order by date desc, rank"""
    )

  
  if table_ref.table_id in ('alluse2'):
    date = request_json.get('date',[])
    city = request_json.get('city',[])
    if isinstance(date, list) and isinstance(city, list):
      date_clause = 'date IN ({})'.format(','.join(str(d) for d in date))
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')
    
    query = (
      f"""SELECT usetime, sum(N) as N, sum(Y) as Y, sum(Card_CNT) as Card_CNT, format("%.0f%%",round(safe_divide(sum(N),sum(Card_CNT)),2)*100) as N_prop, format("%.0f%%",round(safe_divide(sum(Y),sum(Card_CNT)),2)*100) as Y_prop
      FROM `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
      where {date_clause} and {city_clause}
      group by usetime
      order by usetime"""
    )

    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'day_empty_full':

    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    item = request_json.get('item')
    status = request_json.get('status',[])
    sys = request_json.get('sys')
    if isinstance(city, list) and isinstance(status, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      status_clause = 'status IN ({})'.format(','.join(f"'{s.encode('utf-8').decode('utf-8')}'" for s in status))
    else:
      raise RuntimeError('Error')
      
    query += (
      f""" WHERE date between '{begin_date}' and '{end_date}'
      and sys = '{sys}'
      and item = '{item}'
      and {city_clause}
      and {status_clause}
      order by date, s_no, sys, item, status"""
    )


  if table_ref.table_id == 'weekly_empty_full':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    item = request_json.get('item')
    status = request_json.get('status',[])
    sys = request_json.get('sys')
    if isinstance(city, list) and isinstance(status, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      status_clause = 'status IN ({})'.format(','.join(f"'{s.encode('utf-8').decode('utf-8')}'" for s in status))
    else:
      raise RuntimeError('Error')
    
    query += (
      f""" WHERE date between '{begin_date}' and '{end_date}'
      and sys = '{sys}'
      and item = '{item}'
      and {city_clause}
      and {status_clause}
      order by date, s_no, sys, item, status"""
    )


  if table_ref.table_id == 'monthly_empty_full':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    item = request_json.get('item')
    status = request_json.get('status',[])
    sys = request_json.get('sys')
    if isinstance(city, list) and isinstance(status, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      status_clause = 'status IN ({})'.format(','.join(f"'{s.encode('utf-8').decode('utf-8')}'" for s in status))
    else:
      raise RuntimeError('Error')
    
    query += (
      f""" WHERE date between '{begin_date}' and '{end_date}'
      and sys = '{sys}'
      and item = '{item}'
      and {city_clause}
      and {status_clause}
      order by date, s_no, sys, item, status"""
    )


  if table_ref.table_id == 'CTI_final_table':
    sys = request_json.get('sys')
    if sys == '1.0':
      city = request_json.get('city')
      if city not in ('NTP', 'Taoyuan', 'Hsinchu_one', 'Miaoli', 'Taichung_one'):
        raise RuntimeError('Error')
      else:
        date = request_json.get('date')
    elif sys == '2.0':
      city = request_json.get('city')
      if city not in ('TP', 'NTP2', 'Taoyuan_two', 'Hsinchu_two', 'HsinchuCountry', 'Miaoli_two', 'Taichung_two', 'Chiayi', 'Kaohsiung', 'Tainan', 'Pingtung', 'Taitung'):
        raise RuntimeError('Error')
      else:
        date = request_json.get('date')
    query = (
      f"""SELECT *, (hangup-hangup_le_six) as hangup_gt_six, round(safe_divide((hangup-hangup_le_six),total),3) as hangup_gt_six_percentage
      FROM `upheld-now-268802.{dataset_ref.dataset_id}.CTI_{city}_total_table`
      where date = '{date}'
      order by time_range
      """
    )
    rows = client.query(query).result()
    data = []
    for row in rows:
      row_dict = dict(row)
      row_dict['before_avg_duration'] = row_dict['before_avg_duration'].strftime('%H:%M:%S')
      row_dict['avg_duration'] = row_dict['avg_duration'].strftime('%H:%M:%S')
      data.append(row_dict)
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'CTI_person_work':
    sys = request_json.get('sys')
    if sys == '1.0':
      city = request_json.get('city')
      if city not in ('NewTaipei_one', 'Taoyuan', 'Hsinchu_one', 'Miaoli_one', 'Taichung_one'):
        raise RuntimeError('Error')
      else:
        date = request_json.get('date')
    elif sys == '2.0':
      city = request_json.get('city')
      if city not in ('Taipei_two', 'NewTaipei_two', 'Taoyuan_two', 'Hsinchu_two', 'HsinchuCountry_two', 'Miaoli_two', 'Taichung_two', 'Chiayi', 'Tainan', 'Kaohsiung', 'Pingtung', 'Taitung'):
        raise RuntimeError('Error')
      else:
        date = request_json.get('date')
        
    query += (
      f""" WHERE date_partition = '{date}'
      and city = '{city}'
      order by AID"""
    )


  if table_ref.table_id == 'CTI_callout':
    date = request_json.get('date')
    
    query += (
      f""" WHERE date_partition = '{date}'
      order by AID"""
    )


  if table_ref.table_id == 'CTI_inline_detail':
    sys = request_json.get('sys')
    if sys == '1.0':
      city = request_json.get('city')
      if city not in ('NTP', 'Taoyuan', 'Hsinchu', 'Miaoli', 'Taichung'):
        raise RuntimeError('Error')
      else:
        date = request_json.get('date')
    elif sys == '2.0':
      city = request_json.get('city')
      if city not in ('TP', 'NTP2', 'Taoyuan_two', 'Hsinchu2', 'Hsinchu_Country', 'Miaoli_two', 'Taichung2', 'Chiayi', 'Tainan', 'Kaohsiung', 'Pingtung', 'Taitung'):
        raise RuntimeError('Error')
      elif city == 'TP':
        date = request_json.get('date')
        query = (
          f"""select a.time_range, a.total as total_two, a.hangup as hangup_two, a.answer as answer_two, 
          b.total as total_1999, b.hangup as hangup_1999, b.answer as answer_1999,
          c.total as total_5511, c.hangup as hangup_5511, c.answer as answer_5511
          from (
            select time_range, total, hangup, answer
            from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
            where date = '{date}' and city = '{city}' and answer_line = 'TP_two'
          ) as a
          full join
          (
            select time_range, total, hangup, answer
            from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
            where date = '{date}' and city = '{city}' and answer_line = 'TP_1999'
          ) as b
          on a.time_range = b.time_range
          full join
          (
            select time_range, total, hangup, answer
            from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
            where date = '{date}' and city = '{city}' and answer_line = 'TP_5511'
          ) as c
          on a.time_range = c.time_range
          order by a.time_range
          """
        )
        rows = client.query(query).result()
        data = []
        for row in rows:
          data.append(dict(row))
        response = make_response(jsonify(data))
        response = add_cors_headers(response)
        return response
      elif city == 'Kaohsiung':
        date = request_json.get('date')
        query = (
          f"""select a.time_range, a.total as total_two, a.hangup as hangup_two, a.answer as answer_two, 
          b.total as total_0800, b.hangup as hangup_0800, b.answer as answer_0800
          from (
            select time_range, total, hangup, answer
            from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
            where date = '{date}' and city = '{city}' and answer_line = 'Kaohsiung_two'
          ) as a
          full join
          (
            select time_range, total, hangup, answer
            from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
            where date = '{date}' and city = '{city}' and answer_line = 'Kaohsiung_0800'
          ) as b
          on a.time_range = b.time_range
          order by a.time_range
          """
        )
        rows = client.query(query).result()
        data = []
        for row in rows:
          data.append(dict(row))
        response = make_response(jsonify(data))
        response = add_cors_headers(response)
        return response
      else:
        date = request_json.get('date')

    query += (
      f""" WHERE date = '{date}'
      and city = '{city}'
      order by time_range"""
    )


  if table_ref.table_id in ('CTI_hangup_detail'):
    sys = request_json.get('sys')
    if sys == '1.0':
      city = request_json.get('city')
      if city not in ('NTP_one', 'Taoyuan', 'Hsinchu_one', 'Miaoli', 'Taichung_one'):
        raise RuntimeError('Error')
      else:
        date = request_json.get('date')
    elif sys == '2.0':
      city = request_json.get('city')
      if city not in ('TP_two', 'NTP_two', 'Taoyuan_two', 'Hsinchu_two', 'HsinchuCountry', 'Miaoli_two', 'Taichung_two', 'Chiayi', 'Tainan', 'Kaohsiung', 'Pingtung', 'Taitung'):
        raise RuntimeError('Error')
      else:
        date = request_json.get('date')

    query = (
      f"""SELECT mobile, SKILLS, income, hang_up, PID
      FROM `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
      where date = '{date}'
      and city = '{city}'
      order by hang_up
      """
    )

    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'daily_lost':
    date = request_json.get('date')
    city = request_json.get('city',[])
    if isinstance(city, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')

    query += (
      f""" WHERE date = '{date}'
      and {city_clause}
      order by city, sys, status"""
    )


  if table_ref.table_id in ('weekly_report_maintain_query1'):
    date = request_json.get('date')
    city = request_json.get('city')
    query += (
      f""" WHERE date between '{date}'-21 and '{date}'
      and city = '{city}'
      union all
      select *
      from `report.daily_report_maintain_query1`
      where date between '{date}' and '{date}'+6
      and city = '{city}'
      order by date, v2"""
    )

    rows = client.query(query).result()
    data = []
    data.append(['date','city','日期','星期','天氣','日雨量(毫米)','溫度','使用次數','每萬次使用次數','周轉率','合約標準數','達成數','週/日達成率','1分鐘以上無位可還總分鐘數','站數','週/日達成率(無位可還)','5分鐘以上無位可還次數','10分鐘以上無位可還次數','20分鐘以上無位可還次數','10分鐘無位可還比率','10分鐘無位可還每萬次發生率','1分鐘以上無車可借總分鐘數','站數','週/日達成率(無車可借)','A級場站10分鐘以上無車可借次數','B級場站10分鐘以上無車可借次數','C級場站10分鐘以上無車可借次數','無車綁車10分鐘以上次數(全時段)','無車綁車10分鐘以上次數(06-23)','無車綁車1分鐘總分鐘數(全時段)','10分鐘無車可借比率','10分鐘無車可借每萬次發生率'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('weekly_report_maintain_query2'):
    date = request_json.get('date')
    city = request_json.get('city')
    query += (
      f""" WHERE date between '{date}'-21 and '{date}'
      and city = '{city}'
      union all
      select *
      from `report.daily_report_maintain_query2`
      where date between '{date}' and '{date}'+6
      and city = '{city}'
      order by date, v2"""
    )

    rows = client.query(query).result()
    data = []
    data.append(['date','city','日期','星期','天氣','日雨量(毫米)','溫度','使用次數','每萬次使用次數','周轉率','合約標準數','達成數','週/日達成率','1分鐘以上無位可還總分鐘數','站數','週/日達成率(無位可還)','10分鐘以上無位可還次數','10分鐘無位可還比率','10分鐘無位可還每萬次發生率','1分鐘以上無車可借總分鐘數','站數','週/日達成率(無車可借)','A級場站10分鐘以上無車可借次數','B級場站20分鐘以上無車可借次數','C級場站30分鐘以上無車可借次數','無車綁車10分鐘以上次數(全時段)','無車綁車10分鐘以上次數(06-23)','無車綁車1分鐘總分鐘數(全時段)','10分鐘無車可借比率','10分鐘無車可借每萬次發生率'])
    for row in rows:
      data.append(list(row.values()))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('weekly_report_maintain_rank1','weekly_report_maintain_rank2'):
    date = request_json.get('date')
    city = request_json.get('city')
    item = request_json.get('item',[])
    if isinstance(item, list):
      item_clause = 'item IN ({})'.format(','.join(f"'{i.encode('utf-8').decode('utf-8')}'" for i in item))
    else:
      raise RuntimeError('Error')

    query += (
      f""" WHERE date = '{date}' and city = '{city}' and {item_clause} order by item, rank"""
    )


  if table_ref.table_id in ('weekly_report_query1'):
    date = request_json.get('date')
    city = request_json.get('city',[])
    city_length = len(city)
    if city_length != 0:
      if 'all' not in city :
        if isinstance(city, list):
          city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
        else:
          raise RuntimeError('Error')
      else:
        city_clause = 'city is not null'
    else:
      return []
    query += (
      f""" WHERE date between '{date}'-21 and '{date}'
      and {city_clause}
      union all
      select *
      from `report.daily_report_query1`
      where date between '{date}' and '{date}'+6
      and {city_clause}
      order by city, date, val2"""
    )

    rows = client.query(query).result()
    data = []
    x = ['date','city','日期','星期','天氣','日雨量(亳米)','溫度','場站資訊','新增站數','總啟用站數','新增車位數','總停車位','合約車輛數','車位比','租借資訊','當週/日租借車次','當月租借車次','當年租借車次(千次)','累積租借車次(千次)','周轉率','收入資訊','預估政府補助金額','其他租賃收入','租賃收入合計','每趟次平均消費金額','妥善率資訊','車輛可動率','Kiosk妥善率','網路連通率','停車架服務時數妥善率','上線車輛妥善率','自行車輛上線率','票卡資訊','轉乘使用次數','月票使用次數','敬老使用次數','轉乘使用卡片數','月票使用卡片數','敬老使用卡片數','註冊票卡淨刪減數','註冊票卡淨增加數','WEB','KIOSK','APP','累計有效票卡數','WEB','KIOSK','APP','新增註冊會員數','WEB','KIOSK','APP','累計註冊會員數','WEB','KIOSK','APP','當日租借車次','電子票證','悠遊卡','一卡通','掃碼租車','單次租車','LINE Pay','悠遊付','註冊票卡淨增加數','電子票證','悠遊卡','一卡通','掃碼租車','LINE Pay','悠遊付','租借資訊','甲租乙還(次數)','甲租乙還(%比率)','各時段使用資訊','0-5分鐘(次數)','0-5分鐘(%比率)','5-15分鐘(次數)','5-15分鐘(%比率)','15-30分鐘(次數)','15-30分鐘(%比率)','30-60分鐘(次數)','30-60分鐘(%比率)','60-120分鐘(次數)','60-120分鐘(%比率)','120-240分鐘(次數)','120-240分鐘(%比率)','240-480分鐘(次數)','240-480分鐘(%比率)','480分鐘以上(次數)','480分鐘以上(%比率)','租賃收入明細','悠遊卡','一卡通','信用卡','掃碼租車','單次租車','LINE Pay','悠遊付','租賃收入合計']
    for row in rows:
      data.append(list(row.values()))

    result = []
    current_city = None
    current_group = []
    for row in data:
        if row[x.index('city')] != current_city:
            if current_group:
                result.append(current_group)
            current_group = []
            current_group.append(x)
            current_city = row[x.index('city')]
        current_group.append(row)
    if current_group:
        result.append(current_group)
    response = make_response(jsonify(result))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('weekly_report_query2'):
    date = request_json.get('date')
    city = request_json.get('city',[])
    city_length = len(city)
    if city_length != 0:
      if 'all' not in city :
        if isinstance(city, list):
          city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
        else:
          raise RuntimeError('Error')
      else:
        city_clause = 'city is not null'
    else:
      return []
    query += (
      f""" WHERE date between '{date}'-21 and '{date}'
      and {city_clause}
      union all
      select *
      from `report.daily_report_query2`
      where date between '{date}' and '{date}'+6
      and {city_clause}
      order by city, date, val2"""
    )

    rows = client.query(query).result()
    data = []
    x = ['date','city','日期','星期','天氣','日雨量(亳米)','溫度','場站資訊','新增站數','總啟用站數','新增車位數','總停車位','合約車輛數','車位比','租借資訊','當週/日租借車次','當月租借車次','當年租借車次(千次)','累積租借車次(千次)','周轉率','收入資訊','預估政府補助金額','其他租賃收入','租賃收入合計','每趟次平均消費金額','妥善率資訊','車輛可動率','Kiosk妥善率','網路連通率','停車架服務時數妥善率','上線車輛妥善率','自行車輛上線率','票卡資訊','轉乘使用次數','月票使用次數','敬老使用次數','轉乘使用卡片數','月票使用卡片數','敬老使用卡片數','註冊票卡淨刪減數','註冊票卡淨增加數','WEB','KIOSK','APP','累計有效票卡數','WEB','KIOSK','APP','新增註冊會員數','WEB','KIOSK','APP','累計註冊會員數','WEB','KIOSK','APP','當日租借車次','電子票證','悠遊卡','一卡通','掃碼租車','單次租車','LINE Pay','悠遊付','註冊票卡淨增加數','電子票證','悠遊卡','一卡通','掃碼租車','LINE Pay','悠遊付','租借資訊','甲租乙還(次數)','甲租乙還(%比率)','各時段使用資訊','0-5分鐘(次數)','0-5分鐘(%比率)','5-15分鐘(次數)','5-15分鐘(%比率)','15-30分鐘(次數)','15-30分鐘(%比率)','30-60分鐘(次數)','30-60分鐘(%比率)','60-120分鐘(次數)','60-120分鐘(%比率)','120-240分鐘(次數)','120-240分鐘(%比率)','240-480分鐘(次數)','240-480分鐘(%比率)','480分鐘以上(次數)','480分鐘以上(%比率)','租賃收入明細','悠遊卡','一卡通','信用卡','掃碼租車','單次租車','LINE Pay','悠遊付','租賃收入合計']
    for row in rows:
      data.append(list(row.values()))

    result = []
    current_city = None
    current_group = []
    for row in data:
        if row[x.index('city')] != current_city:
            if current_group:
                result.append(current_group)
            current_group = []
            current_group.append(x)
            current_city = row[x.index('city')]
        current_group.append(row)
    if current_group:
        result.append(current_group)
    response = make_response(jsonify(result))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('weekly_report_query2E'):
    date = request_json.get('date')
    city = request_json.get('city',[])
    city_length = len(city)
    if city_length != 0:
      if 'all' not in city :
        if isinstance(city, list):
          city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
        else:
          raise RuntimeError('Error')
      else:
        city_clause = 'city is not null'
    else:
      return []
    query += (
      f""" WHERE date between '{date}'-21 and '{date}'
      and {city_clause}
      union all
      select *
      from `report.daily_report_query2E`
      where date between '{date}' and '{date}'+6
      and {city_clause}
      order by city, date, val2"""
    )

    rows = client.query(query).result()
    data = []
    x = ['date','city','日期','星期','天氣','雨量','溫度','營運資訊','上線車輛數','租借資訊','當週/日租借車次','當月租借車次','當年租借車次(千次)','累積租借車次(千次)','周轉率','收入資訊','預估政府補助金額','其他租賃收入','租賃收入合計','每趟次平均消費金額','當週/日租借車次','電子票證','悠遊卡','一卡通','掃碼租車','單次租車','LINE Pay','悠遊付','租借資訊','甲租乙還(次數)','甲租乙還(%比率)','轉乘使用次數','月票使用次數','敬老使用次數','轉乘使用卡片數','月票使用卡片數','敬老使用卡片數','租賃時間使用資訊','平均租賃時間','0-5分鐘(次數)','0-5分鐘(%比率)','5-15分鐘(次數)','5-15分鐘(%比率)','15-30分鐘(次數)','15-30分鐘(%比率)','30-60分鐘(次數)','30-60分鐘(%比率)','60-120分鐘(次數)','60-120分鐘(%比率)','120-240分鐘(次數)','120-240分鐘(%比率)','240-480分鐘(次數)','240-480分鐘(%比率)','480分鐘以上(次數)','480分鐘以上(%比率)','租賃收入明細','悠遊卡','一卡通','信用卡','掃碼租車','單次租車','LINE Pay','悠遊付','租賃收入合計','維護管理','更換電池數','電池低於50%派工次數','電池低於50%完成派工數','電池低於50%派工達成率','電池低於20%以下進用發生次數','電池低於5%以下發生次數','調度管理','6時重點場站車輛配置率','16時重點場站車輛配置率','騎乘距離分析','總平均騎乘公里數','1公里以下','1-3公里','3-5公里','5-10公里','10公里以上']
    for row in rows:
      data.append(list(row.values()))

    result = []
    current_city = None
    current_group = []
    for row in data:
        if row[x.index('city')] != current_city:
            if current_group:
                result.append(current_group)
            current_group = []
            current_group.append(x)
            current_city = row[x.index('city')]
        current_group.append(row)
    if current_group:
        result.append(current_group)
    response = make_response(jsonify(result))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'month_insur':
    date = request_json.get('date')
    query = (
      f"""select city, insur, total, percentage
      from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
      where date = '{date}'
      order by rank"""
    )
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'add_del_card':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')

    query += (
      f""" where date between '{begin_date}' and '{end_date}'
      order by date, rank"""
    )


  if table_ref.table_id in ('CTI_daily_detail'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city')
    sys = request_json.get('sys')
    query += (
      f""" WHERE date between '{begin_date}' and '{end_date}' and city =  '{city}' and system = '{sys}' order by date, rank"""
    )
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))

    result = []
    current_date = None
    current_group = []
    for row in data:
        if row['date'] != current_date:
            if current_group:
                result.append(current_group)
            current_group = []
            current_date = row['date']
        current_group.append(row)
    if current_group:
        result.append(current_group)

    response = make_response(jsonify(result))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('CTI_monthly_report'):
    date = request_json.get('date')
    city = request_json.get('city')
    if city == 'Taipei_NewTaipei':
      query += (
        f""" WHERE substring(month,1,4) = '{date}'
        and rank between 4 and 14
        order by month_rank, rank"""
      )
    elif city == 'Taoyuan_Hsinchu_Miaoli':
      query += (
        f""" WHERE substring(month,1,4) = '{date}'
        and (rank = 4 or (rank >= 15 and rank < 27))
        order by month_rank, rank"""
      )
    elif city == 'Taichung':
      query += (
        f""" WHERE substring(month,1,4) = '{date}'
        and (rank = 4 or rank between 27 and 30)
        order by month_rank, rank"""
      )
    elif city == 'Chiayi':
      query += (
        f""" WHERE substring(month,1,4) = '{date}'
        and (rank = 4 or (rank >= 31 and rank < 33))
        order by month_rank, rank"""
      )
    elif city == 'Tainan_Kaohsiung_Pingtung':
      query += (
        f""" WHERE substring(month,1,4) = '{date}'
        and (rank = 4 or rank between 33 and 38)
        order by month_rank, rank"""
      )
    else:
      raise RuntimeError('Error')


  if table_ref.table_id == 'refund_report':
    date = request_json.get('date')
    query += (
      f""" WHERE date = '{date}' order by date, rank, sys"""
    )


  if table_ref.table_id in ('CTI_summary_table'):
    date = request_json.get('date')
    item = request_json.get('item')
    query += (
      f""" WHERE date = '{date}'
      and group_no = {item}
      order by rank"""
    )


  if table_ref.table_id == 'bike_checklist_hour_report':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    city = replace_name(city)
    hour = request_json.get('hour',[])
    if isinstance(city, list) and isinstance(hour, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      hour_clause = 'hour IN ({})'.format(','.join(f"{h}" for h in hour))
    else:
      raise RuntimeError('Error')
    
    query = (
      f"""
      select * except (use_bike, domestic_bike), format('%2.2f%%', round(use_bike/domestic_bike,4)*100) as bike_used_percent
      from(
        select *, format('%2.2f%%', round(safe_divide(total,bike_number),4)*100) as percentage, (total-bike_number) as different,
        in_station+use as use_bike, in_station+use+repair+dispatch as domestic_bike
        from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
        where date between '{begin_date}' and '{end_date}'
        and {city_clause}
        and {hour_clause}
        order by date, hour, rank, sys
      )
      """
    )

    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response

  
  if table_ref.table_id in ('bike_station_chart'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    item = request_json.get('item')
    area = request_json.get('area',[])
    if isinstance(city, list) and isinstance(area, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      if item == '行政區':
        if 'all' not in area:
          area_clause = 'SxPSArea IN ({})'.format(','.join(f"'{a.encode('utf-8').decode('utf-8')}'" for a in area))
        else:
          area_clause = 'SxPSArea is not null'
      elif item == '調度分區':
        if 'all' not in area:
          area_clause = 'responsible_area IN ({})'.format(','.join(f"'{a.encode('utf-8').decode('utf-8')}'" for a in area))
        else:
          area_clause = 'responsible_area is not null'
    else:
      raise RuntimeError('Error')
    
    query = (
      f""" select date, city, sum(bike_greater_90_count) as bike_greater_90_count, sum(bike_90_85_count) as bike_90_85_count, sum(bike_85_80_count) as bike_85_80_count, sum(bike_low_80_count) as bike_low_80_count, sum(station_greater_99_count) as station_greater_99_count, sum(station_99_95_count) as station_99_95_count, sum(station_95_90_count) as station_95_90_count, sum(station_low_90_count) as station_low_90_count
      from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
      WHERE date between '{begin_date}' and '{end_date}'
      and {city_clause}
      and {area_clause}
      group by 1,2
      """
    )


  if table_ref.table_id in ('bike_station_line_chart'):
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    item = request_json.get('item')
    area = request_json.get('area',[])
    if isinstance(city, list) and isinstance(area, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      area_clause = 'area IN ({})'.format(','.join(f"'{a.encode('utf-8').decode('utf-8')}'" for a in area))
    else:
      raise RuntimeError('Error')
    
    query += (
      f""" WHERE date between '{begin_date}' and '{end_date}'
      and item = '{item}'
      and {city_clause}
      and {area_clause}
      order by status, area
      """
    )


  if table_ref.table_id == 'bike_status_email':
    status = request_json.get('status')

    if status == "low_battery":
        query = (
          f"""select sys, city, s_no, card_type, bike_no, asset_no, group_no, low_battery, return_time_lb, cumulative_time_lb
              from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
              where low_battery = '1'
              and asset_no != '0660090'
          """
        )

    if status == "loss_time":
        query = (
          f"""select sys, city, s_no, card_type, bike_no, asset_no, group_no, loss_time, return_time_lt, cumulative_time_lt
              from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
              where group_no not in ('3','5','6','7','8','11') and loss_time = '1'
              and asset_no != '0660090'
          """
        )

    if status == "not_maintained":
        query = (
          f"""select sys, city, s_no, card_type, bike_no, asset_no, group_no, not_maintained, created_time, cumulative_time_nm
              from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
              where not_maintained = '1'
              and asset_no != '0660090'
          """
        )

    if status == "battery_between_21_30":
        query = (
          f"""select sys, city, s_no, card_type, bike_no, asset_no, group_no, battery_between_21_30, return_time_b23, cumulative_time_b23
              from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
              where battery_between_21_30 = '1'
              and asset_no != '0660090'
          """
        )


  if table_ref.table_id in ('station_for_areainfo'):
    city = request_json.get('city',[])
    print(city)
    if isinstance(city, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')

    query += (
      f""" WHERE {city_clause}"""
    )

    rows = client.query(query).result()
    df = rows.to_dataframe()
    name = list(df['city'].drop_duplicates())
    data = {}
    name_length = len(name)
    for i in range(name_length):
        city = name[i]
        ad_area = list(df[(df['city'] == city) & (df['SxPSArea'].notna())]['SxPSArea'].drop_duplicates())
        respon_area = list(df[(df['city'] == city) & (df['responsible_area'].notna())]['responsible_area'].drop_duplicates())
        data[city] = {'ad_area': ad_area, 'respon_area': respon_area}

    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id == 'station_empty_city_info':
    first_request_time = (datetime.now()+timedelta(hours=8))
    query = (
      f"""
      select a.city, a.status, a.tie_bike, coalesce(b.station_count,0) as station_count
      from `yb2.station_empty_city_info` as a
      full join
      (
        select 
        (case when sno between 500101001 and 500198999 then 'Taipei'
        when sno between 500201001 and 500298999 then 'Newtaipei'
        when sno between 500301001 and 500398999 then 'Taoyuan'
        when sno between 500401001 and 500498999 then 'Hsinchu'
        when sno between 508201001 and 508298999 then 'Hsinchu_science'
        when sno between 500501001 and 500598999 then 'Hsinchu_country'
        when sno between 500701001 and 500798999 then 'Miaoli'
        when sno between 500601001 and 500698999 then 'Taichung'
        when sno between 501001001 and 501098999 then 'Chiayi'
        when sno between 501101001 and 501198999 then 'Chiayi_country'
        when sno between 501201001 and 501298999 then 'Kaohsiung' 
        when sno between 501301001 and 501398999 then 'Tainan'
        when sno between 501401001 and 501498999 then 'Pingtung'
        end) as city, status, tie_bike, count(*) as station_count
        from (
          select sno, status, (case when (sbi+bemp)!=tot then 1 else 0 end) as tie_bike
          from `yb2.station_empty_info`
          where updatetime is null 
          union all
          select sno, status, 2 as tie_bike
          from `yb2.station_empty_info`
          where updatetime is null
        )
        group by 1,2,3
      ) as b
      on a.city = b.city and a.status = b.status and a.tie_bike = b.tie_bike
      order by a.city, a.status, a.tie_bike
      """
    )
    date_time = datetime.now()+timedelta(hours=8)
    second_time = date_time.second
    delete_time = date_time-timedelta(days=5)
    second_request_time = (datetime.now()+timedelta(hours=8))
    if second_time < 22 :
      updated_at = (datetime.now()+timedelta(hours=8)-timedelta(minutes=1)).strftime('%Y-%m-%d %H:%M:00')
    else:
      updated_at = (datetime.now()+timedelta(hours=8)).strftime('%Y-%m-%d %H:%M:00')
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    # for item in data:
    #     print(item['city'], item['status'], item['tie_bike'], item['station_count'])
    print(f'first : {first_request_time}\nsecond: {second_request_time}')
    response_data = {'updated_at': updated_at, 'data': data}
    response = make_response(jsonify(response_data))
    response = add_cors_headers(response)
    if date_time.hour == 23 and date_time.minute == 59:
      client.query(f"delete yb2.station_empty_info where updatetime <= '{delete_time}'")
    return response


  if table_ref.table_id == 'station_empty_city_timerange_info':
    query = (
      f"""
      select a.city, a.status, a.time_range, coalesce(b.station_count,0) as station_count
      from `yb2.station_empty_city_timerange_info` as a
      full join
      (
        select 
        (case when sno between 500101001 and 500198999 then 'Taipei'
        when sno between 500201001 and 500298999 then 'Newtaipei'
        when sno between 500301001 and 500398999 then 'Taoyuan'
        when sno between 500401001 and 500498999 then 'Hsinchu'
        when sno between 508201001 and 508298999 then 'Hsinchu_science'
        when sno between 500501001 and 500598999 then 'Hsinchu_country'
        when sno between 500701001 and 500798999 then 'Miaoli'
        when sno between 500601001 and 500698999 then 'Taichung'
        when sno between 501001001 and 501098999 then 'Chiayi'
        when sno between 501201001 and 501298999 then 'Kaohsiung' 
        when sno between 501301001 and 501398999 then 'Tainan'
        when sno between 501401001 and 501498999 then 'Pingtung'
        end) as city, status, time_range, count(*) as station_count
        from (
          select sno, status,
          (case when diff_time <= 15 then '0-15'
          when diff_time between 16 and 30 then '30'
          when diff_time between 31 and 45 then '45'
          when diff_time between 46 and 60 then '60'
          when diff_time between 61 and 75 then '75'
          when diff_time between 76 and 90 then '90'
          when diff_time between 91 and 150 then '150'
          when diff_time between 151 and 210 then '210'
          when diff_time between 211 and 270 then '270'
          when diff_time between 271 and 330 then '330'
          when diff_time between 331 and 390 then '390'
          when diff_time >= 391 then '+390' end) as time_range
          from(
            select sno, status,
            datetime_diff(current_datetime('+08'), createtime, minute) as diff_time
            from (select sno, status, (case when extract(date from createtime) != extract(date from current_datetime('+08')) then datetime_trunc(current_datetime('+08'), day) else createtime end) as createtime, datetime_add(updatetime, interval 1 minute) as updatetime from `yb2.station_empty_info`)
            where (updatetime is null or 
            (extract(date from updatetime) = extract(date from current_datetime('+08')) and extract(hour from updatetime) = extract(hour from current_datetime('+08')) and extract(minute from updatetime) = extract(minute from current_datetime('+08'))))
          )
        )
        group by 1,2,3
      ) as b
      on a.city = b.city and a.status = b.status and a.time_range = b.time_range
      order by a.city, a.status
      """
    )
    second_time = (datetime.now()+timedelta(hours=8)).second
    if second_time < 22 :
      updated_at = (datetime.now()+timedelta(hours=8)-timedelta(minutes=2)).strftime('%Y-%m-%d %H:%M:00')
    else:
      updated_at = (datetime.now()+timedelta(hours=8)-timedelta(minutes=1)).strftime('%Y-%m-%d %H:%M:00')
    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response_data = {'updated_at': updated_at, 'data': data}
    response = make_response(jsonify(response_data))
    response = add_cors_headers(response)
    return response


  if table_ref.table_id in ('station_alert'):
    s_no = request_json.get('s_no',[])
    if isinstance(s_no, list):
      sno_clause = 's_no in ({})'.format(','.join(f"{s}" for s in s_no))
    else:
      raise RuntimeError('Error')

    current_time = datetime.now() + timedelta(hours=8)
    if current_time.minute > 30:
      sent_time = current_time.replace(minute=30, second=0).strftime('%Y-%m-%d %H:%M:%S')
    else:
      sent_time = current_time.replace(minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S')

    # sent_time = '2024-06-11 09:00:00'

    query = (
      f"""
      select x.city, x.send_time, x.sarea, x.sna, x.tot, x.sbi, x.status, y.total
      from(
        select city, format_datetime('%H:%M', date) as send_time, sarea, s_no, sna, tot, sbi, status
        from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
        where date = '{sent_time}'
        and {sno_clause}
      ) as x
      left join
      (
        select s_no, sna, status, count(*) as total 
        from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
        group by 1,2,3
      ) as y
      on x.s_no = y.s_no and x.status = y.status
      """
    )

    print('email sended')

    query_job = client.query(query)
    df = query_job.to_dataframe()

    df.drop(['send_time'], axis=1, inplace=True)
    df['send_time'] = pd.to_datetime(sent_time)
    df['tot'] = df['tot'].astype(int)
    df['sbi'] = df['sbi'].astype(int)
    df['date'] = datetime.strptime(sent_time[:10], '%Y-%m-%d').date()

    print(df)

    client.load_table_from_dataframe(df, 'upheld-now-268802.yb2.station_alert_backup')

    print("backup done")
    print(s_no)


  if table_ref.table_id in ('bike_station_monthly_average_line_chart'):
    date = request_json.get('date')
    day_status = request_json.get('day_status')
    city = request_json.get('city',[])
    item = request_json.get('item')
    area = request_json.get('area',[])
    if isinstance(city, list) and isinstance(area, list):
      city_clause = 'city IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
      area_clause = 'area IN ({})'.format(','.join(f"'{a.encode('utf-8').decode('utf-8')}'" for a in area))
    else:
      raise RuntimeError('Error')
    
    query += (
      f""" WHERE date = '{date}'
      and day_status = '{day_status}'
      and item = '{item}'
      and {city_clause}
      and {area_clause}
      order by status, area
      """
    )

  # 歷史擋住
  if table_ref.table_id == 'daily_block_pillar':
    begin_date = request_json.get('begin_date')
    end_date = request_json.get('end_date')
    city = request_json.get('city',[])
    city = replace_name(city)
    if isinstance(city, list):
      city_clause = 'country_name IN ({})'.format(','.join(f"'{c.encode('utf-8').decode('utf-8')}'" for c in city))
    else:
      raise RuntimeError('Error')
    
    query = (
      f"""
      select *
      from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
      where date between '{begin_date}' and '{end_date}'
      and {city_clause}
      order by date, s_no
      """
    )

    rows = client.query(query).result()
    data = []
    for row in rows:
      data.append(dict(row))
    response = make_response(jsonify(data))
    response = add_cors_headers(response)
    return response








  if table_ref.table_id in ('test_check'):
    s_no = request_json.get('s_no',[])
    if isinstance(s_no, list):
      sno_clause = 's_no in ({})'.format(','.join(f"{s}" for s in s_no))
    else:
      raise RuntimeError('Error')

    sent_time = '2024-08-08 09:00:00'

    query = (
      f"""
      select x.city, x.send_time, x.sarea, x.sna, x.tot, x.sbi, x.status, y.total
      from(
        select city, format_datetime('%H:%M', date) as send_time, sarea, s_no, sna, tot, sbi, status
        from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
        where date = '{sent_time}'
        and {sno_clause}
      ) as x
      left join
      (
        select s_no, sna, status, count(*) as total 
        from `upheld-now-268802.{dataset_ref.dataset_id}.{table_ref.table_id}`
        group by 1,2,3
      ) as y
      on x.s_no = y.s_no and x.status = y.status
      """
    )

    print('email sended')

    query_job = client.query(query)
    df = query_job.to_dataframe()

    df.drop(['send_time'], axis=1, inplace=True)
    df['send_time'] = pd.to_datetime(sent_time)
    df['tot'] = df['tot'].astype(int)
    df['sbi'] = df['sbi'].astype(int)
    df['date'] = datetime.strptime(sent_time[:10], '%Y-%m-%d').date()

    print(df)




###################################################################################
###################################################################################


  rows = client.query(query).result()
  data = []
  for row in rows:
    data.append(dict(row))
  response = make_response(jsonify(data))
  response = add_cors_headers(response)
  return response



