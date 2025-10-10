import mongoose from 'mongoose';
import Song from '../models/Song.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample lyrics for testing
const sampleLyrics = {
  "Blinding Lights": `Yeah
I've been tryin' to call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I feel like I'm just missin' somethin' when you're gone
And I'll never be the world without you
I'm just walkin' by to let you know
I can never say it on the phone
Will never let you go this time

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch`,

  "Shape of You": `The club isn't the best place to find a lover
So the bar is where I go
Me and my friends at the table doing shots
Drinking fast and then we talk slow
Come over and start up a conversation with just me
And trust me I'll give it a chance now
Take my hand, stop, put Van the Man on the jukebox
And then we start to dance, and now I'm singing like

Girl, you know I want your love
Your love was handmade for somebody like me
Come on now, follow my lead
I may be crazy, don't mind me
Say, boy, let's not talk too much
Grab on my waist and put that body on me
Come on now, follow my lead
Come, come on now, follow my lead`,

  "Someone Like You": `I heard that you're settled down
That you found a girl and you're married now
I heard that your dreams came true
Guess she gave you things I didn't give to you

Old friend, why are you so shy?
Ain't like you to hold back or hide from the light

I hate to turn up out of the blue, uninvited
But I couldn't stay away, I couldn't fight it
I had hoped you'd see my face
And that you'd be reminded that for me, it isn't over

Never mind, I'll find someone like you
I wish nothing but the best for you, too
Don't forget me, I beg, I remember you said
Sometimes it lasts in love, but sometimes it hurts instead
Sometimes it lasts in love, but sometimes it hurts instead`,

  "default": `[Verse 1]
This is a sample lyric for testing
Music flows through every line
Every word has its own meaning
In this rhythm so divine

[Chorus]
Sing along with the melody
Feel the beat inside your heart
Music brings us all together
Every ending is a start

[Verse 2]
When the world seems dark and lonely
Music lights up every day
Through the speakers and the silence
Music shows us the way

[Chorus]
Sing along with the melody
Feel the beat inside your heart
Music brings us all together
Every ending is a start`
};

const addLyricsToSongs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all songs
    const songs = await Song.find({});
    console.log(`📀 Found ${songs.length} songs`);

    let updatedCount = 0;

    for (const song of songs) {
      // Skip if song already has lyrics
      if (song.lyrics && song.lyrics.trim()) {
        console.log(`⏭️  Skipping "${song.title}" - already has lyrics`);
        continue;
      }

      // Try to find specific lyrics for this song
      let lyrics = sampleLyrics[song.title] || sampleLyrics.default;
      
      // Update song with lyrics
      await Song.findByIdAndUpdate(song._id, { lyrics });
      console.log(`✅ Added lyrics to "${song.title}"`);
      updatedCount++;
    }

    console.log(`\n🎵 Successfully added lyrics to ${updatedCount} songs!`);
    
    // Show some stats
    const songsWithLyrics = await Song.countDocuments({ lyrics: { $exists: true, $ne: '' } });
    const totalSongs = await Song.countDocuments();
    console.log(`📊 Songs with lyrics: ${songsWithLyrics}/${totalSongs}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run the script
addLyricsToSongs();
