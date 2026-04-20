// const ADMIN_EMAIL = 'yasai123a@gmail.com';

function fetchAndNotify() {
  // APIからデータ取得
  const url = 'https://jsonplaceholder.typicode.com/users';
  const response = UrlFetchApp.fetch(url);
  const employees = JSON.parse(response.getContentText());
  
  const failed = [];
  
  employees.forEach(function(employee) {
    
    // 条件分岐：IDが奇数の人だけ処理
    // ← 実案件では「通勤手段 === '自転車'」に置き換わる部分
    if (employee.id % 2 !== 0) {
      try {
        GmailApp.sendEmail(
          ADMIN_EMAIL,  // テストなので自分宛に送信
          '【テスト】' + employee.name + ' さんへの通知',
          employee.name + ' さん\n\n今月の申請をお願いします。\n\n総務部'
        );
        Logger.log('✅ ' + employee.name + ' にメール送信完了');
        
      } catch(e) {
        Logger.log('❌ ' + employee.name + ' でエラー：' + e.message);
        failed.push(employee.name);
      }
    } else {
      Logger.log('⏭️ ' + employee.name + ' はスキップ');
    }
  });
  
  // エラーがあれば管理者に通知
  if (failed.length > 0) {
    GmailApp.sendEmail(
      ADMIN_EMAIL,
      '【エラー通知】送信失敗が発生しました',
      '以下の処理が失敗しました：\n\n' + failed.join('\n')
    );
  }
  
  Logger.log('処理完了');
}