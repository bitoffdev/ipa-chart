var arrHeader = [
{HName:"BDescr", BTitle:"click here to display symbol descriptions & play pronunciation recording(s)", HLabel:"DESCRIPTION", HState:1},
{HName:"BType", BTitle:"click here to insert symbol into the transcription field", BTitleAlt:"click here to insert symbols below", BTitleAlt2:"<br/>use CTRL + C to copy this symbol to clipboard", HLabel:"TRANSCRIPTION", HState:0}
];

var arrTrButtons = [
{TrBTitle:"click here to decrease font size by 10px", TrBLabel:"Aa−−", TrBFunction:"AdjFontSize(-10)", TrBState:0},
{TrBTitle:"click here to decrease font size by 1px", TrBLabel:"Aa−", TrBFunction:"AdjFontSize(-1)", TrBState:0},
{TrBTitle:"click here to reset font size to 20px", TrBLabel:"Aa*", TrBFunction:"AdjFontSize(0)", TrBState:1},
{TrBTitle:"click here to increase font size by 1px", TrBLabel:"Aa+", TrBFunction:"AdjFontSize(1)", TrBState:0},
{TrBTitle:"click here to increase font size by 10px", TrBLabel:"Aa++", TrBFunction:"AdjFontSize(10)", TrBState:0},
{TrBTitle:"click here to clear transcription field", TrBLabel:"&#x2717;", TrBFunction:"ClearField()", TrBState:0},
{TrBTitle:"click here to scroll transcription field with text", TrBTitleAlt:"click here to anchor transcription field at the top", TrBLabel:"&#x2693;", TrBFunction:"AnchorField()", TrBState:1},
{TrBTitle:"click here to automatically resize transcription field", TrBLabel:"&#x2610;", TrBFunction:"ResizeField(1)", TrBState:1},
{TrBTitle:"click here to manually resize transcription field<br/>", TrBTitleIE:"click here to show scroll bar and set size of transcription field to default height (1 line)", 
TrBTitleAlt1a:"&#xE000;", TrBTitleAlt1b:"&#xE001;", 
TrBTitleAlt2:"<i>drag this symbol located in the lower right corner of the field <b>up</b> or <b>down</b> to get the desired field height</i>", 
TrBLabel:"&#x21F2;", TrBLabelIE:"&#xE002;", TrBFunction:"ResizeField(2)", TrBState:0}
];

var arrButtons = [
{BName:["play_1_ex_audio_JE","play_1_ex_audio_JH","play_1_ex_audio_PL","play_1_ex_audio_JW",
		"play_1_ex_1_audio_JE","play_1_ex_1_audio_JH","play_1_ex_1_audio_PL","play_1_ex_1_audio_JW",
		"play_1_ex_2_audio_JE","play_1_ex_2_audio_JH","play_1_ex_2_audio_PL","play_1_ex_2_audio_JW",
		"play_1_ex_3_audio_JE","play_1_ex_3_audio_JH","play_1_ex_3_audio_PL","play_1_ex_3_audio_JW",
		"play_1_audio_JE","play_1_audio_JH","play_1_audio_PL","play_1_audio_JW"], 
		BTitle:"play"},
{BName:"play_2", BTitle:"<b>play</b>", BTitleAlt:"<b>playing</b>", BState:0},
{BName:"pause", BTitle:"<b>pause</b>", BTitleAlt:"<b>paused</b>", BState:0},
{BName:"loop", BTitle:"<b>loop</b>", BTitleAlt:"<b>looped</b>", BState:0},
{BName:"volup", BTitle:"<b>volume up</b>", BTitleAlt:"<b>volume up</b>", BState:0},
{BName:"voldown", BTitle:"<b>volume down</b>", BTitleAlt:"<b>volume down</b>", BState:0},
{BName:"mute", BTitle:"<b>mute</b>", BTitleAlt:"<b>mute</b>", BState:0}
];

var arrNavButtons = [
{NavBTitle1:"previous table: ", NavBTitle2:"first symbol: ", NavBLabel:"«", NavTooltip:""},
{NavBTitle1:"previous symbol: ", NavBTitle2:"table: ", NavBLabel:"‹", NavTooltip:""},
{NavBTitle1:"next symbol: ", NavBTitle2:"table: ", NavBLabel:"›", NavTooltip:""},
{NavBTitle1:"next table: ", NavBTitle2:"first symbol: ", NavBLabel:"»", NavTooltip:""}
];

var arrAudio = ["ex_","ex_1_","ex_2_","ex_3_"];

var arrAuthors = [
{AI:"JE", AName:"J. Esling", ACounter:0},
{AI:"JH", AName:"J. House", ACounter:0},
{AI:"PL", AName:"P. Ladefoged", ACounter:0},
{AI:"JW", AName:"J. Wells", ACounter:0}
];

var arrAudioC = [
{Author:"Prof. John Esling", Name:"IPA charts", Link:"https://web.uvic.ca/ling/resources/ipa/charts/IPAlab/IPAlab.htm", Title:"open IPA charts by J. Esling", Add:"IPA Phonetics for iPhone and iPad", AddLink:"https://www.uvic.ca/humanities/linguistics/resources/software/ipaphonetics/index.php", AddTitle:"visit the UVic software and resources page"},
{Author:"Ms. Jill House", Name:"IPA vowel chart", Link:"http://www.phonetics.ucla.edu/course/chapter1/wells/wells.html", Title:"open IPA vowel chart by J. Wells", Add:"<i>Sounds of the IPA</i> recordings", AddLink:"http://www.phon.ucl.ac.uk/shop/soundsipa.php", AddTitle:"visit the UCL <i>Sounds of the IPA</i> page (UCL shop)"},
{Author:"Prof. Peter Ladefoged", Name:"<i>A course in phonetics</i> (IPA chart)", Link:"http://www.phonetics.ucla.edu/course/chapter1/chapter1.html", Title:"open IPA charts by P. Ladefoged", Add:"", AddLink:"", AddTitle:""},
{Author:"Prof. John Wells", Name:"IPA vowel chart", Link:"http://www.phonetics.ucla.edu/course/chapter1/wells/wells.html", Title:"open IPA vowel chart by J. Wells", Add:"<i>Sounds of the IPA</i> recordings", AddLink:"http://www.phon.ucl.ac.uk/shop/soundsipa.php", AddTitle:"visit the UCL <i>Sounds of the IPA</i> page (UCL shop)"}
];

var arrChanges = [
{Uni:"027E", Name:"voiced dental/alveolar tap", Descr:"no bottom serif"},
{Uni:"0284", Name:"voiced palatal implosive", Descr:"no half cross-bar above the full cross-bar"},
{Uni:"0264", Name:"close-mid back unrounded vowel", Descr:"more distinct ram's horns"},
{Uni:"0334", Name:"velarized or pharyngealized diacritic", Descr:"narrower superimposed tilde"},
{Uni:"033B", Name:"laminal diacritic", Descr:"rectangle instead of square (to make it more distinct from the voiceless diaritic)"},
{Uni:"034F", Name:"combining grapheme joiner", Descr:"dotted outline (to better illustrate diacritic placement)"}
];
