# Changelog

## v1.2.6-beta3 (2021/08/22)
**Improvements:**
- [Settings]画面で[CLEAR CACHE]したあとの[UPDATE LIBRARY]で読み込むキャッシュデータを2021/08頃のデータに更新。
  - 現在正常に動作しているなら[CLEAR CACHE] & [UPDATE LIBRARY] する必要はありません。

**Bug fixes:**
- [Settings]画面の[UPDATE LIBRARY]でメモリを 5-6GB 等大量に使用することがあるのを修正。
  - オリジナル版の不具合。ほかの画面でのメモリ消費は未調査。
- [My Playlists]画面で playlist を編集した時に無応答になる時間を少し削減。

**Others:**
- [Home]画面で `navigator.language` を見て日本語なら日本語の変更履歴を表示するように変更。
- [My Playlists]画面での一括ダウンロードは無効化中。
  - オリジナル版が beatsaver.com の帯域制限に未対応のため。一括ダウンロードは ModAssistant もしくは PlaylistManger で実施してください。
- [Settings]画面の[Discord Rich Presence]の初期値を無効に変更。

<br>

## v1.2.6-beta2 (2021/08/15)
**Features:**
- 「Beatmap Online via beatsaver」画面のページ移動を以下のような挙動に変更。
  - 最終ページへの移動ボタンを削除
  - 「1-20 of xxx」の「 of xxx」の表示を削除
  - 表示件数が 20件未満になるまで次のページに移動可能

**Bug fixes:**
- 「Beatmap Online via beatsaver」画面で検索ボックスの×ボタンを押して検索文字列を削除すると、それ以降検索ボックスが空にも関わらず "null"という文字列で検索が行われていたのを修正。
  - v1.2.6-beta での不具合
- 「Beatmap Online via beatsaver」画面で検索ボックスが空の場合、Latest を指定していても Search(Relevance) での検索結果が表示されることがあるのを修正。
  - v1.2.6-beta での不具合
- playlist に beatsaver.com から取得できない曲が含まれている場合のエラーが2重に記録されていたのを修正。
  - 「Settings」画面の「`xx beatmaps inside some playlists are invalid.`」
  - v1.2.6-beta での不具合

**Others:**
- [My Playlists]画面での一括ダウンロードは無効化中。

<br>

## v1.2.6-beta (2021/08/13)
**Features:**
- beatsaver.com の新APIに暫定対応 (とりあえず動くようにしただけ)
- [Settings]画面で[CLEAR CACHE]したあとの[UPDATE LIBRARY]で、2021/04頃の beatsaver.com の曲情報(約4万件)をキャッシュとして読み込むように修正。
- [My Playlists]画面では beatsaver.com から削除された(あるいは beatsaver.com が落ちていて情報が取得できなかった)曲は表示されないが、CustomLevels 以下にダウンロード済みの曲は表示するように修正。
  - [Saved Beatmaps]画面については v1.2.5 で修正済み。

**Bug fixes:**
- beatsaver.com からダウンロードした zip ファイルがロックされたままになり「`Couldn't extract beatmap. [undefined]: undefined`」エラーになることがあるのを修正。
- beatsaver.com からダウンロードした zip ファイルが「`%APPDATA%\..\Local\Temp`」以下に残ったままになることがあるのを修正。

**Others:**
- [My Playlists]画面での一括ダウンロードは無効化中。
- [Home]画面の変更履歴表示は暫定で非表示。


## v1.2.5 (2021/04/27)
**Features:**
- [Saved Beatmaps]画面では beatsaver.com から削除された(あるいは beatsaver.com が落ちていて情報が取得できなかった)曲は表示されないが、CustomLevels 以下にダウンロード済みの曲は表示するように修正。
