$(function(){
  //セッションストレージクリア
  sessionStorage.clear();
  //現在のチャットリストを処理
  init();
  //#itemsに子要素が追加されるのを監視する
  add_mo('#items.yt-live-chat-item-list-renderer', node_check);
  //#docked-itemに子要素が追加されるのを監視する
  add_mo('#docked-item.yt-live-chat-docked-message', node_check);
});

// 現在のチャットリストを処理
function init(){
  let items = document.querySelector('#items.yt-live-chat-item-list-renderer');
  $(items).children().each(function(){
    node_check($(this));
  });
}

//監視処理の登録
function add_mo(selector, callback){
  let items = document.querySelector(selector);
  let mo = new MutationObserver(function(m, o) {
    m.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node){
        callback($(node));
      });
    });
  });
  mo.observe(items, {childList:true});
}

// 投稿を処理する
function node_check(obj){
  //ownerの場合node_checkする
  if(obj.attr('author-type') == 'owner'){
    node_check_owner(obj);
  }else{
    //owner以外の場合セッションストレージに格納
    setStorageOne(obj);
  }
}

// チャットリストの１アイテムをセッションストレージに格納
function setStorageOne(obj){
  //投稿者取得
  let author = obj.find('#author-name').text().trimEnd();
  //message取得
  let message = obj.find('#message').html(); //text()だと絵文字が取れないのでhtml()
  //セッションストレージに値をセット
  if(author && message){
    message = replaceImgTagsWithAltText(message); //絵文字imgタグをただの絵文字に変換
    message = decodeHtmlEntities(message); //&とかがエンコードされているのでデコード
    sessionStorage.setItem(author, message);
  }
}

// 投稿を処理する（owner）
function node_check_owner(obj){
  //message取得
  let mes_obj = $(obj.find('#message'));
  let message = mes_obj.html(); //text()だと絵文字が取れないのでhtml()
  //messageが＠で始まる場合
  if(message.substring(0, 1) == "＠" || message.substring(0, 1) == "@"){
    message = replaceImgTagsWithAltText(message); //絵文字imgタグをただの絵文字に変換
    message = removeHtmlTags(message); //自分へのリプはspanタグが混ざるので除去
    message = decodeHtmlEntities(message); //&とかがエンコードされているのでデコード
    //セッションストレージからリプ元を探す
    mes = find_reply(message.substring(1));
    if(mes){
      //リプ元のメッセージを挿入
      add_reply(mes_obj, mes);
    }else{
      //console.log('リプ元不明: ' + message);
    }
  }
}

// セッションストレージからリプ元を探す
function find_reply(str){
  for (key in sessionStorage) {
    if (sessionStorage.hasOwnProperty(key)) {
      let str2 = str.replace(/　/g," ");
      let key2 = key.replace(/　/g," ") + ' ';
      if (str2.startsWith(key2)) {
        return sessionStorage.getItem(key);
      }
    }
  }
  return '';
}

// テキストを挿入
function add_reply(obj, str){
  if(str){
    let new_mes = obj.html() + '<br/><br/>＞' + str;
    obj.html(new_mes);
  }
}

// 絵文字を置換
function replaceImgTagsWithAltText(str) {
  if(str){
    return str.replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, '$1');
  }
  return '';
}

// ハイライトHTMLタグを除去
function removeHtmlTags(str) {
  return str.replace(/<[^>]+>/g, '');
}

// HTMLデコード
function decodeHtmlEntities(str) {
  let entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    // その他必要なエンティティをここに追加
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, function(match) {
    return entities[match];
  });
}

// 参考: https://zenn.dev/sakmas/articles/3ff8e744708c9f
