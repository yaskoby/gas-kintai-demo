// const ADMIN_EMAIL = 'yasai123a@gmail.com';  // 管理者メールアドレス
const TEMPLATE_ID = '1oZlwZOC-_Wy7DOOta2IfxhOZr-N-QX7m08l00uXVWqc';  // テンプレートシートのID

function extractCyclists() {
  
    // 今日が月末かチェック
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (tomorrow.getDate() !== 1) {
    Logger.log('今日は月末ではないので処理をスキップします');
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('従業員リスト');
  const data = sheet.getDataRange().getValues();
  // const folder = DriveApp.getRootFolder();  // マイドライブのルートに保存
  // 特定のフォルダに保存したい場合
  const folder = DriveApp.getFolderById('17u4S9jOl2yOpifUFyqN8Zg4wD8LBHs-4');

  const failed = [];
  
  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    const email = data[i][1];
    const commute = data[i][2];
    
    if (commute === '自転車') {
      try {
        // テンプレートをコピーして個人用シートを作成
        const templateFile = DriveApp.getFileById(TEMPLATE_ID);
        // const newFile = templateFile.makeCopy(name + '_交通費申請', folder);
        const yearMonth = today.getFullYear() + '_' + (today.getMonth() + 1) + '月';
        const newFile = templateFile.makeCopy(name + '_交通費申請_' + yearMonth, folder);
        const newSheet = SpreadsheetApp.openById(newFile.getId()).getActiveSheet();
        
        // 氏名と申請月を自動入力
        newSheet.getRange('B1').setValue(name);
        newSheet.getRange('B2').setValue(new Date().getMonth() + 1 + '月');
        
        // 個人用シートのURLをメールに含めて送信
        const fileUrl = newFile.getUrl();
        GmailApp.sendEmail(
          email,
          '【交通費申請のご依頼】今月分の申請をお願いします',
          name + ' さん\n\n今月の自転車通勤交通費の申請をお願いします。\n\n以下のシートに入力してください：\n' + fileUrl + '\n\n総務部'
        );
        Logger.log(name + ' ：シート作成＆メール送信完了');
        
      } catch (e) {
        Logger.log('❌ ' + name + ' でエラー：' + e.message);
        failed.push(name);
      }
    }
  }
  
  if (failed.length > 0) {
    GmailApp.sendEmail(
      ADMIN_EMAIL,
      '【送信エラー通知】処理に失敗しました',
      '以下の従業員の処理が失敗しました：\n\n' + failed.join('\n')
    );
  }
}