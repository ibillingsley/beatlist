# Changelog

**ATTENTION:**
- **2022/04/01,beatsaver.com のエイプリルフールの影響により[Beatmap Online]画面が使えなくなっています。**  
  **日本時間でエイプリルフールが終わっても海外はまだ期間中のため、もう少し続くかもしれません。4/3以降なら復帰するのではないかと思います。**

- beatlist に自動アップデート機能はありませんので、最新版は上記 github アイコンをクリックして Release ページからダウンロードしてください。
- v1.2.6-beta～beta3 からアップデートされる場合は、最新バージョンをインストールしたあとに [Settings]画面で [CLEAR CACHE] & [UPDATE LIBRARY] の実行をお願いします。
- v1.3.1 以前のバージョンからアップデートする場合、初回起動時に playlist のキャッシュを再作成します。  
  キャッシュを再作成している間、スキャン中のダイアログが表示されるのでしばらくお待ちください。

<br>

---

## v1.3.7 (2022/02/12)
**Improvement:**
- サブフォルダーにある playlist を表示するように修正。Issue #3
  - BeatSaber 本体の Playlist Manager プラグインで [Disable Folders & Categories] がオフ(既定値)になっている前提です。  
    Playlist Manager プラグインの設定を変更していなければオフのはずです。  
    オンにしている場合、Beat Saber にはサブフォルダー内の playlist は表示されません。
  - v1.3.6 以前のようにサブフォルダーにある playlist を表示したくない場合は [Settings] 画面の [Disable playlist folder management] をオンにしてください。
- playlist を保存するとき songName も保存するように修正。

**Bug fixes:**
- その他細かい修正。

<br>

## v1.3.6 (2022/01/26)
**Improvement:**
- playlist に含まれる譜面の一括ダウンロードを有効化。
  - 各 playlist の編集画面で [Content] 欄のチェックボックスにチェックを付けて [DOWNLOAD] ボタンを押してください。
- 譜面ダウンロード時、beatsaver.com から 429 Too Many Request エラーが返却された場合、ダウンロードを再開する前に 5秒ほど待機するように修正。
- playlist にハイライト指定がある場合、playlist 編集画面の [Difficulties] 列の○印をハイライト表示するように修正。
  - 表示のみで編集には対応していません。また、表示領域の都合上、Standard/OneSaber/NoArrows/360Degree/90Degree/Lawless の区別はありません。
  - [Beatmap Information] 画面は未対応です。
- [Downloads] 画面で、ダウンロードに失敗した譜面はエラー文言を赤字で表示するように修正。
- [Downloads] 画面で、各ダウンロード譜面に key の表示を追加。
- [Downloads] 画面に Completed の一覧をクリアするボタンを追加。

**Bug fixes:**
- ダウンロードボタンのある画面を表示するたびにメモリ使用量が少しずつ(数MBとか)増えていく不具合(メモリリーク)を修正。
  - オリジナル版(v1.2.4 以前) からあったバグ。
- playlist 内に同じ譜面が重複して登録されている場合、ソートや検索を行うと playlist 編集画面が固まることがある不具合を修正。
- カバー画像のない playlist に曲を追加・削除すると不要な文字列が image に設定されてしまう不具合を修正。
- [Beastsaber Playlists] 画面で playlist をダウンロードすると、たまに意図せず [My Playlists]画面に遷移してしまうことがある不具合を修正。

**Others:**
- 事前に読み込んでおくキャッシュデータを2022/01中旬のもの(約55,000件)に更新。
- 開発上の都合によりダウンロード処理に fetch APIを使用するように変更。
- 使用していないライブラリを削除。

<br>

## v1.3.5 (2021/12/18)
**Bug fixes:**
- 譜面をダウンロードする前に最新のダウンロードURLを取得しなおすように修正。

<br>

## v1.3.4 (2021/12/12)
**Bug fixes:**
- [Saved Beatmaps]画面などで曲名でのソートができない、あるいは削除ボタンを2回押さないと曲を削除できないことがある不具合を修正。(Issue #2)
  - Custom Levels 以下に同じ曲が存在する場合に発生することがあったようです。

<br>

## v1.3.3 (2021/12/06)
**Bug fixes:**
- playlist を編集した時、ファイル名を playlistTitle に合わせて変更しない(既存のファイル名を維持する)ように修正。
  - beatlist で playlist を編集すると、ファイル名が「playlistTitle の英数字以外をアンダーバーに置換した文字列」＋「.json」になるのが
    オリジナル版(v1.2.x)から続く挙動でしたが、ファイル名を変更しないように修正しています。
- 上記に伴い [My Playlists]画面での playlist 新規作成時、playlist の title 入力ダイアログを表示するように変更。

- playlist 編集画面を開いた状態で playlist のファイルが外部プログラムなどによって削除またはリネームされた時、[My Playlists]画面に戻るように修正。
- playlist 編集画面で、title が空欄でも保存できてしまっていたのを修正。

**Others:**
- [Settings]画面の playlist 保存時のインデントの既定値を `None` から `Space (2)` に変更。
  - 影響するのは新規インストール時と v1.3.1 以前からアップデートした場合です。
  - PlaylistManager で新規作成した playlist もインデント・改行ありなのでそれに合わせています。

<br>

## v1.3.2 (2021/11/23)
**ATTENTION:**
- v1.3.1 以前のバージョンからアップデートする場合、初回起動時に playlist のキャッシュを再作成します。  
  キャッシュを再作成している間、スキャン中のダイアログが表示されるのでしばらくお待ちください。

**Improvement:**
- [My Playlists] 画面に title/author/date modified のソートと検索ボックスを追加。
- playlist への曲追加・削除ダイアログに title/author/date modified のソートを追加。
- playlist を上書き保存するとき、難易度のハイライトや syncURL などを消さないように修正。
- [Settings] 画面に playlist 保存時のインデント指定を追加。
  - playlist をテキストエディタなどで直接編集しない場合は気にしなくて結構です。
- playlist や譜面を削除する場合、ゴミ箱に移動するように修正。

<br>

## v1.3.1 (2021/11/05)
**Improvement:**
- [Beatmap Online via Beatsaver]画面に chroma/noodle/mapping extensions/cinema、NPS、日付の絞り込みを追加。
- [Beastsaber Playlists]画面での playlist ダウンロードでは playlist の内容をそのままダウンロードするように修正。
  - 以前のバージョンでは、playlist ダウンロード時に title、author、description、カバー画像および譜面のhash以外の情報を削除してダウンロードしていたので、消さないように修正しました。
  - ただしダウンロードした playlist を beatlist で編集すると、従来通り syncURL や難易度のハイライト表示指定は消えますのでご注意ください。

**Bug fixes:**
- [My Playlists]画面から playlist 編集画面を開いたとき [Contents] 欄や [Browser] 欄は常に先頭ページを表示するように修正。
  - ある playlist の編集画面を開き[Contents] 欄でページ移動後[My Playlists]画面に戻り、別の playlist の編集画面を表示するとページ移動がリセットされていない不具合の修正です。
- Uploaded 列の日付範囲フィルターで、月を選択したり年を選択するたび DatePicker が閉じてしまうのを修正。
- etc.

**Others:**
- 事前に読み込んでおくキャッシュデータを2021/11初旬のもの(約52,000件)に更新。

<br>

## v1.3.0 (2021/10/20)
**Bug fixes:**
- 譜面をダウンロードしようとすると以下のエラーが出る不具合を修正。
  - "Couldn't download beatmap. [Error]: certificate has expired"
- playlist のカバー画像が巨大だと、[Saved Beatmaps]画面や各playlist編集画面のカバー画像のプレビュー画面(※)を閉じることができなくなる不具合を修正。  
  ※ [Playlists]列をクリックすることで表示されるプレビュー

<br>

## v1.2.8 (2021/09/19)
**Features:**
- [Beatmap Online via beatsaver]画面に Ranked と FullSpread の絞り込みを追加。
- CustomLevels 以下の曲について、どの playlist にも含まれない曲を抽出するフィルターを追加。
  - [Saved Beatmaps]画面または各 playlist 編集画面の [Browser]欄で [Playlists]列を表示し、そのフィルターをONにすると抽出されます。
  - ただし、[Playlists]列の表示および絞り込みは曲数が多い場合遅いので必要な時だけ有効化してください。

**Bug fixes:**
- v1.2.7 以降に追加した playlist のカバー画像が jpeg の場合、png 画像に差し替えても cover画像が `data:image/png;base64,xxxx` にならず `data:image/jpeg;base64,xxxx` のままになるのを修正。
- playlist の編集画面で、画像だけ変更して [SAVE]ボタンを押した場合、[Saved]の通知が出ないのを修正。
- [Playlists]列を表示してもカバー画像が表示されないことがあるのを修正。
- [Add/Remove from playlists]ダイアログをESCキーで閉じると、それ以降開けなくなることがあるのを修正。

**Others:**
- 事前に読み込んでおくキャッシュデータを2021/09中旬のもの(約50,000件)に更新。

<br>

## v1.2.7 (2021/09/08)
**Improvement:**
- CustomLevels ディレクトリ以下のファイルの読み込み速度を改善。

**Bug fixes:**
- CustomLevels 以下に数千件データがある場合、初回起動時または[CLEAR CACHE]後の[UPDATE LIBRARY]でメモリ使用量が急増する不具合を修正。
- BOM付きの playlist ファイルを読み込めない不具合を修正。
- playlist の編集画面で、別の playlist を選択しても最初に選択したカバー画像・タイトルなどが表示されたままになる不具合を修正。
- [Beastsaber Playlists]画面でダウンロードしたばかりの playlist を編集した場合、編集が画面に反映されないことがある不具合を修正。
  - 初回編集時のみ。v1.2.6 以前でも編集画面を開きなおせばそれ以降は反映されていたと思われます。
- Beastsaber からダウンロードした playlist のカバー画像が jpeg でも、ダウンロード時に png とみなして保存してしまう不具合を修正。
  - "cover":"data:image/jpeg;base64,xxxx" を "xxxx" 部分はそのまま "cover":"data:image/png;base64,xxxx" で保存してしまう。

<br>

## v1.2.6 (2021/09/04)
**Improvement:**
- [My Playlists]画面でプレイリストを編集した時の処理速度を改善。
  - 高速化の都合上、playlist 編集画面からは Beatmap Information 画面をダイアログ形式で開くように変更。

**Features:**
- [Copy BSR]ボタン追加。
  - ただし beatsaver.com から削除された曲の値は取得できません。

**Bug fixes:**
- [Beatmap Information]画面の[Refresh the data]ボタンを押しても最新情報が画面に反映されないのを修正。
- playlist のカバー画像を読み込めないことがあるのを修正。

<br>

## v1.2.6-beta4 (2021/08/29)
**ATTENTION:**
- すいません。以前 v1.2.6-beta～beta3 をインストールしたかたは、このバージョンをインストールしたあとに [Settings]画面で [CLEAR CACHE] & [UPDATE LIBRARY] の実行をお願いします。
  - 詳細は Release ページをご確認ください。
- [Settings]画面の[Beatsaver server url] は既定値の [Beatsaver] にしてください。[BeatSaberPlus] だと動きません。

**Improvement:**
- [Beatmap Online via beatsaver]画面に Rating でのソートを追加(復活)。アイコンは ThumbsUp に変更。
- [Settings]画面で [UPDATE LIBRARY] ボタンを押した時、前回のスキャンで beatsaver.com から情報を取得できなかった曲を再取得するように修正。
  - 404 エラーの曲は除く。
- [My Playlists]画面でプレイリストを編集した時の処理速度を少し改善。
  - 複数の編集をする場合、`+`/`-`ボタンで曲を1個ずつ追加/削除するよりチェックボックスで曲を選択して一度に追加/削除したほうが多少ましです。

**Bug fixes:**
- [My Playlists]画面で[Remove from playlist]ボタンが押せない、もしくは Content 欄で曲を選択して[REMOVE]ボタンを押しても曲が削除されないことがあるのを修正。
- [Settings]画面の[Invalid beatmaps in playlists]画面や[Invalid beatmaps]画面を ESCキーで閉じるとそれ以降開かなくなることがあるのを修正。
- [difficulties] に Standard 以外の難易度が表示されないのを修正。
- その他エラー修正。

**Others:**
- [Saved Beatmaps]画面に[Refresh the Data]ボタン追加。
  - 変更が反映されないときの手動反映用。beatsaver.com から最新情報を取得すためのもの**ではありません。**
- 2021/08時点の beatsaver.com のキャッシュデータの持ち方を変更。
  - Vuex store に入れずにメモリ上に持つように変更。ファイルサイズは今のところ 100M 未満です。

<br>

## v1.2.6-beta3 (2021/08/22)
**Bug fixes:**
- 初回起動時や[Settings]画面の[UPDATE LIBRARY]ボタンを押した時、また playlist を追加した時、メモリを 5-6GB など大量に使用することがあるのを修正。
  - オリジナル版の不具合。ほかの画面でのメモリ消費は未調査。
- [My Playlists]画面で playlist を編集した時に無応答になる時間を少し削減。

**Others:**
- [Settings]画面で[CLEAR CACHE]したあとの[UPDATE LIBRARY]で読み込むキャッシュデータを2021/08頃のデータに更新。
  - 現在正常に動作しているなら[CLEAR CACHE] & [UPDATE LIBRARY] する必要はありません。
- [Home]画面で内部ブラウザの言語を見て日本語なら日本語の変更履歴を表示するように変更。
- [My Playlists]画面での playlist に含まれる曲の一括ダウンロードは無効化中。
  - オリジナル版が beatsaver.com の新APIでの帯域制限に(おそらく)未対応のため。一括ダウンロードは ModAssistant もしくは PlaylistManger で実施してください。
- [Settings]画面の[Discord Rich Presence]の初期値を無効に変更。

**ATTENTION:**
- (2021/08/23) [Settings]画面の[Beatsaver server url] は既定値の [Beatsaver] にしてください。[BeatSaberPlus] だと動きません。

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
- [My Playlists]画面での playlist に含まれる曲の一括ダウンロードは無効化中。

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
- [My Playlists]画面での playlist に含まれる曲の一括ダウンロードは無効化中。
- [Home]画面の変更履歴表示は暫定で非表示。


## v1.2.5 (2021/04/27)
**Features:**
- [Saved Beatmaps]画面では beatsaver.com から削除された(あるいは beatsaver.com が落ちていて情報が取得できなかった)曲は表示されないが、CustomLevels 以下にダウンロード済みの曲は表示するように修正。
