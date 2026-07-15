const KEYS={progress:'infractions_progress_v1',settings:'infractions_settings_v1',exams:'infractions_exam_history_v1'};
export const DEFAULT_INFRACTION_SETTINGS={quizLength:10,examLength:20,newPerDay:10,categories:[],questionTypes:['points','fine','type','class','hasPoints','sanction'],showLegalReferences:false,includeComplementary:true,flashcardType:'infraction-sanctions',dailyMode:'flashcards'};
function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value&&typeof value===typeof fallback?value:fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value));return value}
export const getInfractionProgress=()=>read(KEYS.progress,{});export const saveInfractionProgress=value=>write(KEYS.progress,value);
export const getInfractionSettings=()=>({...DEFAULT_INFRACTION_SETTINGS,...read(KEYS.settings,{})});export const saveInfractionSettings=value=>write(KEYS.settings,{...DEFAULT_INFRACTION_SETTINGS,...value});
export const getInfractionExamHistory=()=>read(KEYS.exams,[]);export const saveInfractionExamHistory=value=>write(KEYS.exams,Array.isArray(value)?value.slice(-50):[]);
export const infractionStorageKeys=()=>({...KEYS});
