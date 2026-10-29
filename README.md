# PoopTracker instruments

Ready-to-play instruments for [PoopTracker](https://github.com/miratcan/pooptracker), the tracker whose samples are
videos. Every file here is one instrument: a short video with its settings (region, hit point, base note, envelope,
where it comes from) inside its own metadata. Drop one on PoopTracker and it arrives tuned and ready.

## Layout

One folder per kind of sound. Sub-folders are fine (`lyrics/tr/`, `lyrics/en/`).

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
3. Check the hit point, tune it, set its name and envelope.
4. **Trim** it to its region, then **Save** under the instrument list. Put the file in the right folder with a
   lowercase, dash-separated name (`bir-seyler-calin.mp4`): no spaces, no `?`, `#` or `%`.

Keep them short (a few seconds at most) and in MP4 with H.264 and AAC: AV1, VP9 or Opus play in Chrome but not in
QuickTime or Safari.

## Checks

Every push and pull request runs `tools/check.mjs` with PoopTracker's own format code: a file must be an `.mp4` with
H.264 and AAC, in a folder, named as above, at most 5 MB and trimmed to its region, with a valid PoopTracker instrument
in its metadata. An instrument without a Source gets a warning. To run it before you push, with PoopTracker checked out
next to this repository:

```
node tools/check.mjs ../pooptracker
```

## Takedown

These are clips of a few seconds, each with its source. If one of them is yours and you want it gone,
[open an issue](https://github.com/miratcan/pooptracker-instruments/issues) with its path and it will be removed, no
questions asked.
