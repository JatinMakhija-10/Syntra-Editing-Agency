# Instagram Reels Added to Syntra Website

## Summary

Added 5 Instagram Reels to the "Shorts, Reels & TikTok" section of the Syntra website.

## New Content

### Instagram Reels Added:

1. **Pilates Training Reel**
   - URL: https://www.instagram.com/reel/DVL0R4nku7F/
   - Creator: @pilatescoachshilpa
   - Description: Shilpa Kanodia | Pilates Trainer & Face Yoga Coach

2. **Pilates Workout Reel**
   - URL: https://www.instagram.com/reel/DUIvnQCihJg/
   - Creator: @pilatescoachshilpa
   - Description: Shilpa Kanodia | Pilates Trainer & Face Yoga Coach

3. **Face Yoga Coach**
   - URL: https://www.instagram.com/reel/DVtKhzQii63/
   - Creator: @pilatescoachshilpa
   - Description: Shilpa Kanodia | Pilates Trainer & Face Yoga Coach

4. **Health & Wellness**
   - URL: https://www.instagram.com/reel/DSU2LLxiD2c/
   - Creator: @drpreetigyne
   - Description: Dr. Preeti Nitsure Deshpande

5. **Medical Awareness**
   - URL: https://www.instagram.com/reel/DQmAJf4iAfU/
   - Creator: @drpreetigyne
   - Description: Dr. Preeti Nitsure Deshpande

## Technical Implementation

### Files Modified:

1. **`Website/src/servicesData.js`**
   - Added 5 new Instagram Reel entries at the top of the "Shorts, Reels & TikTok" videoShowcase array
   - Each entry includes:
     - `type: 'instagram'`
     - `src: [embed URL]`
     - `title: [descriptive title]`
     - `description: [creator handle]`

2. **`Website/src/components/VideoEmbed.jsx`**
   - Enhanced to support Instagram embed type
   - Added Instagram-specific iframe configuration:
     - `scrolling="no"`
     - `allowTransparency="true"`
     - `allow="encrypted-media"`
     - Proper styling for Instagram embeds
   - Maintained loading states and error handling

## Features

### Instagram Embed Support:
- ✅ Proper iframe attributes for Instagram
- ✅ Loading spinners while content loads
- ✅ Error handling for unavailable content
- ✅ Smooth fade-in transitions
- ✅ Accessible ARIA labels
- ✅ Responsive design
- ✅ Theme-aware styling

### User Experience:
- Instagram Reels appear first in the Shorts section
- Followed by existing Google Drive videos
- Seamless integration with existing video showcase
- Consistent styling across all video types
- Mobile-friendly display

## How to View

1. Navigate to the Syntra website
2. Go to the **Services** section
3. Click on the **VIDEO** category tab
4. Click on the **"Shorts, Reels & TikTok"** service card
5. The Instagram Reels will appear at the top of the Video Showcase section

## Notes

- Instagram embeds require the Instagram embed script, but the iframe embed method used doesn't require external scripts
- All embeds use `/embed` suffix for clean iframe integration
- Embeds are lazy-loaded for better performance
- The aspect ratio is maintained at 16:9 (aspect-video) for consistency with other videos

## Future Enhancements

Consider adding:
- Click-through links to Instagram profiles
- Instagram post captions
- View counts (if available via API)
- More Instagram content from these creators
- TikTok embed support using similar pattern

---

**Date Added**: June 9, 2026
**Total Instagram Reels**: 5
**Section**: VIDEO → Shorts, Reels & TikTok
**Status**: ✅ Live and Working
