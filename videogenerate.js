const ffmpeg = require('fluent-ffmpeg');
const Creatomate = require('Creatomate');
const { endianness } = require('os');
const { text } = require('stream/consumers');

async function generatevideo(transcption_details , video_details , audio_link) {
    const client = new Creatomate.client("api key"); // instance created for using creatomate , creatomate is a lib which does this all rendering adding videos composition stuff

    // creating scenes array for each video segment provided 

    const scenes = video_details.map(video , index) => ({  // we had an arrary of video details we looped through it took one video and added it to the scenes array secion, created the 
                                                        // created the composition  , which means part of a big video ,or mini videos 
        type : 'composition',
        duration: video.duration,  // duration of that selectd mini video from video details 
        elements: [     // now we go deep into that selected video 
            {
                type: 'video' ,  // type of that elemnt aka video 
                source : video.url , // its source 
                fit :'cover', // it would ensure that video gets fitted on the screen compeltly 
            },
            {
                type: 'text', // now we move on to captions part of that selected mini video 
                text: getTranscriptionFortime(transcption_details, 
                    video.startTime),// this section would provide us with the captions of the current video by using start and end time of the video 
                y:'85%',  // height of the caption 
                color : '#ffffff'
                background_color :    'rgba(0,0,0,0.5)',
                animations : [
                    new Creatomate.TextSlideUpLineByLine({  // basic ass animation 
                        time:0,
                        duration:1,
                        easing : 'quadratic-out'
        
                    })
                ]
                
            }
        ]
    })  // scene array for would contain several mini videos which need to be added toghether in the required format , we used map function to iterate over the videos which were in video detail section 

    ///add background audio code block  

    const audioElement ={  // time to add audio 
        type:'audio',
        source : audio_link,
        duration: getTotalDuration(video_details),
        audioFadeOut : 2 ,
    };

    //render the final video code block

    const render = await client.render({ // wait for the rendering before further processing 
        output_format : 'mp4',  // render the final video  , this would take all the elements of scenes array which contains each video object from the video details array in required format to be added and processed further 
        elements:[              
            audioElement,
            ...scenes,
        ]
        
    });
    return render.url ; // return the url of the video 
      
}
// these are helper functions to find the transcrption aka caption time
function getTranscriptionFortime(transcriptons , time){
    return transcriptons.find(t=>
        time>=t.startTime && time <= t.endTime)?.text || '';  // this function would get us the caption of the required time period . eg if the selected video from vedio details
}                                                             // video detail array is 0-3 sec.this function would look for any caption that is present in that time period from transcripton database
// this helper function would find the total duration of final video 
function getTotalDuration(videos){
    return videos.reduce((sum, video)=> sum+video.duration,0)   // reduce function is used to accumalate value , sum is the accumalator here in which videos length would be stored
}                                                               // video - selected video , sum + ( video.duration=> this would give currnt length of the selected video and add it to sum ) , for now value of sum is 0


// example code that would use this function :

const transcriptions = [
    { text: "Hello world", startTime: 0, endTime: 3 },
    { text: "Second text", startTime: 3, endTime: 6 } // example of transcption is present 
  ];
  
  const videos = [
    { url: "video1.mp4", duration: 3, startTime: 0 },  // example of video array is their 
    { url: "video2.mp4", duration: 3, startTime: 3 },
  ];
  
  const audioUrl = "background-music.mp3"; // this would contain the audion for background 
  
  const videoUrl = await generatevideo(transcriptions, videos, audioUrl); // here we caled the generate function which would give us the final url of renderd file 
                                                                          // we would await for the url , and would not procedd further 