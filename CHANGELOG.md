# Changelog

## v1.5.0  (2025-03-07)
**Features:**
 - Supports V4 maps.
 - <a href="https://github.com/AllPoland/ArcViewer" target="_blank">ArcViewer</a> replaces Rabbit's viewer for previews.
 - Added setting for ArcViewer.exe path to use desktop version (preview maps without redownloading).
 - Added option to customize actions column buttons.
 - Added checkbox to clear local cache without clearing BeatSaver cache.
 - Added context menu.
 - Table width increased to full page width.
 - Remember window size and position.
 - Updated Electron to version 25.

**Bug fixes:**
 - Fixed freezing on startup.
 - Fixed sorting by uploaded date.
 - Fixed beatmap information page for maps with no with no BeatSaver data.
 - Fixed order of beatmaps with no with no BeatSaver data in playlists.

## v1.4.1 (2022-07-29)
**Bug fixes:**
 - Added a process to correct a bug when upgrading to v1.4.0.
   - When updating, the Playlist will be rescanned. Please wait until it finishes.
   - The display of the maps/playlists in BeatSaber is not affected.
   - This does not occur with new installations of v1.4.0.

## v1.4.0 (2022-07-23)
**ATTENTION:**
 - To revert back to v1.3.x after installing v1.4.0, uninstall v1.4.0, delete the data as described in [Troubleshooting_en] - [Method 2] on the Wiki, and then install v1.3.x.

**Improvement:**
 - Added columns for `BPM`, `Song Length` and `Requirements` on the [Saved Beatmaps] screen, etc.
   - `Requirements` are considered to be specified if at least one requirement is specified for any of the difficulty levels (Easy/Normal/Hard/Expert/ExpertPlus).  
     The meanings of the letters shown are as follows:
     - `CR`: Chroma
     - `NE`: Noodle
     - `ME`: Mapping Extensions
     - `CI`: Cinema
   - `Song Length` cannot be displayed for map that have been downloaded but removed from beatsaver.com.
 - Removed columns for `Downloads` and `Plays` from the [Saved Beatmaps] screen, etc.
   - `Downloads` and `Plays` were removed because they are always 0.
 - Added `Curated` and `Verified Mapper` filters to the [Beatmap Online] screen.
 - The cover image in the [Saved Beatmaps] screen and the [Browser] field of each playlist edit screen has been modified to use a downloaded image.
 - For maps in the pre-load cache, modified to retrieve the cover image from the CDN corresponding to the location.
 - `Song length`, `Hash`, `nps` and `Requirements` has been added to the [Beatmap Information] screen.
 - In the [Beatmap Information] screen, the selected tabs are now underlined.

**Bug fixes:**
 - Fixed a problem where numerical items could not be sorted correctly on the [Saved Beatmaps] screen, etc.
 - Other minor bug fixes.

**Others:**
 - The preloaded cache data has been updated to that of late July 2022 (approximately 64,000 items).

## v1.3.8 (2022-04-08)
**ATTENTION:**
 - When updating from v1.3.7 or earlier, the download date of map will be read at the first startup.  
   While it reads, a dialog box will appear during the scan. Please wait for a while.

**Improvement:**
 - The download date are now displayed on the [Saved Beatmaps] screen, etc.
   - Enable "Download Date" from the header selection field.
   - Once the download date are loaded, they are not automatically updated.  
     If you want to update the download date, press the [Refresh] button on the [Saved Beatmaps] screen.
   - It is not displayed in the [Content] pane of the [Beatmaps Online] screen or the playlist edit screen.
   - The calculation of the download date is based on the BetterSongList plug-in.
 - Fixed the date filtering for maps under the Custom Levels folder to use local time.
 - When filtering by date, if the same date is specified for From and To, data from 0:00 to 23:59 of that day will be extracted.
   - Excluding the [Beatmap Online] screen.
 - Sorting by key has been added.
 - Added a [LATEST RELEASE] button to the [Home] screen to open the github Release page.

**Bug fixes:**
 - Fixed a bug that caused loading to fail when a playlist had a blank hash value. Issue #4
 - Fixed that when there are many songs in Custom Levels, it takes a long time to select all songs in the Content column of the playlist edit screen.
 - Other minor bug fixes.

**Others:**
 - Changed [Copy BSR] icon to twitch icon.
 - The preloaded cache data has been updated to that of late March 2022 (approximately 59,000 items).

## v1.3.7 (2022-02-12)
**ATTENTION:**
 - If you are updating from a version earlier than v1.3.2, the playlist cache will be recreated on the first launch.  
   While the cache is being recreated, a dialog box will appear during the scan. Please wait for a while.

**Improvement:**
 - Fixed to show the playlist in the subfolder. Issue #3
   - It is assumed that [Disable Folders & Categories] is turned off in the Playlist Manager plug-in of BeatSaber.  
     If you haven't changed the setting of Playlist Manager plug-in, it should be off.  
     If turned on, Beat Saber will not display the playlists in the subfolders.
   - If you don't want to display playlists in subfolders as in v1.3.6 or earlier, turn on [Disable playlist folder management] in the [Settings] screen.
 - Changed so that songName is also saved when saving the playlist.

**Bug fixes:**
 - Other minor fixes.

## v1.3.6 (2022-01-26)
**ATTENTION:**
 - If you are updating from a version earlier than v1.3.2, the playlist cache will be recreated on the first launch.  
   While the cache is being recreated, a dialog box will appear during the scan. Please wait for a while.

**Improvement:**
 - Enabled bulk download of maps contained in playlist.
   - In the edit screen of each playlist, check the checkbox in the [Content] and press the [DOWNLOAD] button.
 - When downloading maps, if beatsaver.com returns a 429 Too Many Request error, beatlist now waits 5 seconds before resuming the download.
 - When maps in playlist has beem highligted, the circle in the [Difficulties] field of the playlist edit screen is now highlighted.
   - Only supports display, not editing. Also, due to the display area, there is no distinction between Standard/OneSaber/NoArrows/360Degree/90Degree/Lawless.
   - [Beatmap Information] screen is not supported.
 - In the [Downloads] screen, the error message is now displayed in red when a map fails to download.
 - Added key display for each downloaded map in [Downloads] screen.
 - Added a button that clear the download history in the [Downloads] screen.

**Bug fixes:**
 - Fixed a memory leak that caused memory usage to increase by a small amount (like a few MB) every time a screen with a download button was displayed.
   - This bug has existed since the original version (v1.2.4 or earlier).
 - Fixed a bug that the playlist editiong screen freezes if the same score exists in the playlist.
 - Fixed a bug where saving a playlist without a cover image would set an unnecessary string to the image.
 - Fixed a bug in which downloading a playlist from the [Beastsaber Playlists] screen would sometimes unintentionally redirect to the [My Playlists] screen.

**Others:**
 - Updated the cache data to be loaded in advance to mid-January 2022 (about 55,000 items).
 - Changed the download process to use the fetch API for development purposes.
 - Removed libraries that are no longer needed.

## v1.3.5 (2021-12-18)
**ATTENTION:**
 - If you are updating from a version earlier than v1.3.2, the playlist cache will be recreated on the first launch.  
   While the cache is being recreated, a dialog box will appear during the scan. Please wait for a while.

**Bug fixes:**
 - Fixed to re-fetch the latest download URL before downloading the map.

## v1.3.4 (2021-12-12)
**ATTENTION:**
 - If you are updating from a version earlier than v1.3.2, the playlist cache will be recreated on the first launch.  
   While the cache is being recreated, a dialog box will appear during the scan. Please wait for a while.

**Bug fixes:**
 - Fixed a bug that sometimes it was not possible to sort by song title or delete a song without pressing the delete button twice. (#2)
   - This bug may occur when the same song exists under Custom Levels.

## v1.3.3 (2021-12-06)
**ATTENTION:**
 - If you are updating from a version earlier than v1.3.2, the playlist cache will be recreated on the first launch.  
   While the cache is being recreated, a dialog box will appear during the scan. Please wait for a while.

**Bug fixes:**
 - When editing a playlist, the file name will not be changed to match the playlistTitle.
   - From v1.2.4 to v1.3.2, when editing a playlist in beatlist, the file name would change to "playlistTitle with non-alphanumeric characters replaced with underscores" + ".json".  
     ex) title: "My playlists 2021" -> filename: "my_playlists_2021.json"
   - This version has been modified to not change (to keep) the file name.
 - When creating a new playlist in the [My Playlists] screen, the playlist title input dialog will now be displayed.
 - When a playlist file is deleted or renamed by an external program while the playlist editing screen is open, it will return to the [My Playlists] screen.
 - Fixed a bug in the playlist edit screen that allowed saving even if the title value was blank.

**Others:**
 - The default indent for saving a playlist in the [Settings] screen has been changed from `None` to `Space (2)`.

## v1.3.2 (2021-11-23)
**ATTENTION:**
 - If you are updating from a version earlier than v1.3.2, the playlist cache will be recreated on the first launch.  
   While the cache is being recreated, a dialog box will appear during the scan. Please wait for a while.

**Improvement:**
 - Added title/author/date modified sorting and text searching to the [My Playlists] screen.
 - Added title/author/date modified sorting to the add/remove songs from playlist dialog.
 - When overwriting the playlist, the difficulty highlight, syncURL, etc. are now preserved (maybe).
 - Added indentation settings for saving playlists in the [Settings] screen.
   - If you are not going to edit the playlist directly with a text editor, don't worry about it.
 - Deleting playlists and maps now moves them to the recycle bin.

## v1.3.1 (2021-11-05)
**Improvement:**
 - Added chroma/noodle/mapping extensions/cinema, NPS, and date filter to the [Beatmap Online via Beatsaver] screen.
 - In [Beastsaber Playlists] screen, the contents of the playlist are now downloaded as is.
    - In previous versions, when downloading a playlist from the [Beastsaber Playlists] screen, all information except for the title, author, description, cover image, and hash of the songs was deleted. This fixed the problem.
    - However, if you edit the downloaded playlist, syncURL, difficulty highlighting, etc. will disappear as before.

**Bug fixes:**
 - Fixed the [Contents] and [Browser] panes to always show the first page when the playlist editing screen is opened from the [My Playlists] screen.
 - Fixed a bug that DatePicker closing every time you select a month or year in the Uploaded column's date range filter.
 - etc.

**Others:**
 - Updated the cache data to be loaded in advance to early November 2021 (about 52,000 items).

## v1.3.0 (2021-10-20)
**Bug fixes:**
 - Fixed a bug that following error occurs when downloading songs.
    - "Couldn't download beatmap. [Error]: certificate has expired"
 - Fixed a bug that the preview screen of the cover image in the [Saved Beatmaps] screen and each playlist editing screen could not be closed when the cover image of the playlist was huge.

## v1.2.8 (2021-09-19)
**Features:**
 - Added Ranked and FullSpread filter to the [Beatmap Online via beatsaver] screen.
 - Added a filter to extract songs that are not included in any playlist.
   - Display the [Playlists] column in the [Saved Beatmaps] screen or in the [Browser] pane of each playlist editing screen, and turn on the filter.
   - However, the display and refinement of the [Playlists] column is slow when there are many songs, so enable it only when necessary.

**Bug fixes:**
 - Fixed a bug that the content of cover image is not `data:image/png;base64,xxxx` but remains `data:image/jpeg;base64,xxxx` even if the cover image of playlist is replaced from jpeg image to png image.
 - Fixed a bug in the playlist edit screen that the [Saved] notification did not appear when only the image was changed and the [SAVE] button was pressed.
 - Fixed a bug that the cover image may not be displayed when the [Playlists] column is displayed.
 - Fixed a bug that the [Add/Remove from playlists] dialog could not be opened after closing it with the ESC key.

**Others:**
 - Updated the cache data to be loaded in advance to mid-September 2021 (about 50,000 items).

## v1.2.7 (2021-09-08)
**Improvement:**
 - Improved loading speed for files under the CustomLevels directory.

**Bug fixes:**
 - Fixed a bug that may use a large amount of memory (Fix again).
 - Fixed a bug that the playlist with BOM could not be loaded.
 - Fixed a bug in the playlist edit screen that the first selected cover image, title, etc. is still displayed even if another playlist is selected.
 - Fixed a bug where editing a newly downloaded playlist from Beastsaber would not be reflected on the screen.
 - etc.

## v1.2.6 (2021-09-04)
**Features:**
 - Support the new beatsaver api.
 - Add [Copy BSR] button.

**Improvement:**
 - Changed to load beatsaver.com data as of August 2021 as a cache when executing [CLEAR CACHE] & [UPDATE LIBRARY] in the Settings screen.
 - When the [UPDATE LIBRARY] button is pressed, songs that could not be retrieved are now retrieved again.
   - exclude 404 error.
 - Improved the processing speed when editing a playlist in the My Playlists screen.

**Bug fixes:**
 - Fixed a problem that the songs deleted from beatsaver.com are not displayed in playlist even if they exist in the CustomLevels directory.
 - Fixed a bug that may use a large amount of memory when executing [UPDATE LIBRARY] in the Settings screen.
 - Fixed a problem where a zip file downloaded from beatsaver.com would remain locked, resulting in a "`Couldn't extract beatmap. [undefined]: undefined`" error.
 - Fixed a problem where zip files downloaded from beatsaver.com would sometime remain under `%APPDATA%\..\Local\Temp`.
 - Fixed a bug that caused an error when closing a dialog with the ESC key.
 - Fixed a bug that the cover images of some playlists could not be loaded.
 - etc.

**Others:**
 - DiscordRichPresense disabled by default.
 - Changed the Home screen to show the change history in Japanese if the browser language is Japanese.
 - Batch downloads in the My Playlists screen are being disabled.
 - Added [Refresh the Data] button to the [Saved Beatmaps] screen.

## v1.2.5 (2021-04-27)
**Bug fixes:**
 - Fixed a problem that the songs delete from beatsaver.com are not displayed in [Saved Beatmaps] page even if they exist in the CustomLevels directory.

## v1.2.4 (2020-12-30)
**Bug fixes:**
 - Do not remove the playlist thumbnail when adding songs. (#80, #82)

This is the final version of beatlist, and the repo will be archived. See README.MD for more information.

## v1.2.3 (2020-12-18)
**Features:**
 - Handling rate limit (#77)
 - Added a mirror of beatsaver, BeatSaberPlus, available in options (#79)

**Improvement:**
 - If you had a lot of playlist, beatlist could be slow. It should now handle better. (#75)

**Bug fixes**:
 - Download should now work again (#78)

## v1.2.2 (2020-09-02)
**Improvement:**
 - Added a way to display in which playlist(s) a beatmap is the table (#40, #65)
 - Some rephrasing & installation path detection change (#59)
 
**Bug fixes:**
 - Snackbar is now displayed in white when using the white mode
 - & is now whitelisted as character for the folder's name
 - Rewording from "cancel" to "close" (#61)
 
Many thanks to @SWinxy and @SpellcheckerExtraordinaire for their contributions in this release
 
## v1.2.1 (2020-06-10)
**Improvement:**
 - Colorblind mode (difficulties badges can now have a letter or be grey-scaled)
 - All pages are now "keep-alive", so you won't lose your search and filter if you change page.
 - Preview button directly on the row in some tables (#43)
 - Adjust naming convention to match ModAssistant and BeatSaverDownloader (#39)
 - The song preview will now be stopped if you change page
 
## v1.2.0 (2020-05-18)
**Features:**
 - Rework of the whole UI, it now uses table and overall the app is denser.
 - Along with tables, you can now do bulk action such as download all beatmaps from a playlist.
 - There's a little button to preview the music on each beatmap page

**Improvement:**
 - More filter and search possibilities, locally.
 - A better scanner, more efficient and a cache system so you don't spam beatsaver server.
 - New users are welcomed with a message
 - You can now see the reason if a playlist or a beatmap failed to be loaded in beatlist.
 - Option to automatically start the download after opening a one-click install button.
 - Downloader queue

**Bug fixes:**
 - Should now handle bigger scan without white screen.
 - Download should no longer fail after the application being unfocused.
 - One click will no longer be enabled by default at each startup.
 - If an important folder such as playlists or custom level does not exist, beatlist will handle the creation of them.
 - No longer undeletable beatmap.
 - Paginate back to page 1 when changing the query.
 
Any kind of feedback is welcome, don't hesitate to DM me on discord. And yes, 2-4 weeks prediction from the previous release note was a failure oof.

## v1.1.4 (2020-01-05)
**Quick change:**
 - Changed the way beatlist download beatmap on the background to help the beatsaver server.

A quite huge update should come soon (I hope I can do it within 2-4 weeks) with a lot of fixes and improvements. :)

## v1.1.3 (2019-12-02)
**Bug fixes:**
 - Fixed the search bar for online beatmap. Oops.

## v1.1.2 (2019-11-24)
**Features:**
 - Discord Rich Presence added
 - Now support the OneClick button on beatsaver.com
 
**Improvements:**
 - Changed license to MIT
 - Added a button to open the folder in the context of playlist or beatmap.

**Bug fixes:**
 - An invalid character from the folder name resulted to an error
 - Not all song were shown on the playlist editor on the song browser
 - Fixed the clear button on the search bar. It now really clear the input.

## v1.1.1 (2019-11-16)
**Improvements:**
 - Added an button to preview beatmap (external website)
 - Skeleton loader for online playlist page
 - Redirect on settings page if no valid settings available (first time user)
 - The app can now compute beatmap hash on its own
 - Added a discord server for beatlist

**Bug fixes:**
 - Songhashdata.dat is no longer required
 - Fixed various bug in playlists
 - Song are now scanned automatically when you launch the app

## v1.1.0 (2019-10-06)
**Features:**
 - Online beatmap download (beatsaver.com)
 - Online playlist download (bsaber.com)

**Improvements:**
 - Major
   - Automatically detect new beatmap installed
   - Material design 2.0 upgrade, updated the design
   - More information when you click on a beatmap
   - On local song:
     - Sort by Date, Downloads, Plays, Upvotes, Downvotes, Rating
     - Filter by difficulties (#7) and/or bpm.
   
 - Minor:
   - Use of installer instead of executable.
   - Playlist filename are now synced with their title.
   - New default playlist cover image.
   - You can now delete a beatmap.
   - Link in description are now clickable.
   - The local beatmap scanner is now smarter and will only check for the difference.

**Bug fixes:**
 - (#5) Wrong image could be displayed if the user search fast
 - Fixed app icon, it could be badly displayed.
 
<a href="https://www.notion.so/Beatlist-V1-1-848d401722464698a106011a03d359be" target="_blank">See more (include screenshots)</a>

## v1.0.3 (2019-07-05)

**Features:**
 - Playlist list/grid are now clickable

**Fixes:**
 - (#-) Some songs were not displayed in the playlist

## v1.0.2 (2019-07-03)

**Fixes:**
 - (#2) Songs scan: directories path are case sensitive

## v1.0.1 (2019-07-01)

**Fixes:**
 - (#1) Title is not saved when editing a playlist

## v1.0.0 (2019-06-30)

Release of beatlist

**Features:**
 - Manage playlist/songs
 - Scan local song
 - Read old playlist, convert to json, use hash as key
 - Search + Grid/List view layout
 - Settings validation form for installation path
 - UI preference in settings
 - FAQ and Home page

## v0.1.0 (2019-06-18)

Beginning of the project :)
