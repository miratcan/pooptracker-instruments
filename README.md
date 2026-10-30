# PoopTracker instruments

Ready-to-play instruments for [PoopTracker](https://github.com/miratcan/pooptracker), the tracker whose samples are
videos. Every file here is one instrument: a short video with its settings (region, hit point, base note, envelope,
where it comes from) inside its own metadata. In PoopTracker, **Lib.** under the instrument list lists them all: find
one, hear it, add it. Or drop a file on PoopTracker: it arrives tuned and ready.

## Layout

One folder per kind of sound. Sub-folders are fine (`lyrics/tr/`, `lyrics/en/`).

The folders are the categories, and there is no fixed list: put your instrument where it fits, or open a new folder
when nothing does. If it belongs somewhere else, the review will say so, and folders get merged or split as the
collection grows.

```
cowbell/   lyrics/en/   lyrics/tr/   slap/   snare/
```

## Adding an instrument

1. Download the video as H.264 and AAC, with its link inside:

   ```
   yt-dlp -S vcodec:h264,acodec:aac --embed-metadata <url>
   ```

2. Put it on PoopTracker's workbench (**Bench**), mark the piece and cut it. The instrument's **Source** is filled in
   by itself: the video's link at the second the piece starts. For a video of your own, type it (`own recording`).
3. Check the hit point, tune it, set its envelope, and give it a name that says what it is (`Snare 1`, `Taksim`,
   not the workbench's `All Evans S 0:04`). Tags help people find it (`snare hit`); they are optional.
4. **Trim** it to its region, then **Save** under the instrument list. Put the file in the right folder with a
   lowercase, dash-separated name (`bir-seyler-calin.mp4`): no spaces, no `?`, `#` or `%`.

Keep them short (a few seconds at most) and in MP4 with H.264 and AAC: AV1, VP9 or Opus play in Chrome but not in
QuickTime or Safari.

## Checks

Every push and pull request runs `tools/check.mjs` with PoopTracker's own format code: a file must be an `.mp4` with
H.264 and AAC, in a folder, named as above, at most 5 MB and trimmed to its region, with a valid PoopTracker instrument
in its metadata. An instrument without a Source, or still with the workbench's name, gets a warning. To run it before you push, with PoopTracker checked out
next to this repository:

```
node tools/check.mjs ../pooptracker
```

## index.json

The list PoopTracker loads the collection from: each instrument's path, name, length, size, tags, focus and source, read from its
own metadata. Don't edit it: on `main` the workflow writes it after every merge (`node tools/check.mjs --index` does
the same by hand).

## Contributing

By opening a pull request you say that you may share the clip, and you agree that it is removed if its owner asks.
The tools here (`tools/`, `.github/`) are under the same license as PoopTracker, the
[WTFPL](https://github.com/miratcan/pooptracker/blob/main/LICENSE).

## Takedown

These are clips of a few seconds, each with its source. If one of them is yours and you want it gone,
[open an issue](https://github.com/miratcan/pooptracker-instruments/issues) with its path: it is taken out of the
collection, no questions asked. If you want it gone from the repository's history too, say so in the issue.
