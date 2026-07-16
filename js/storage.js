const KEYS={progress:'panneaux_progress_v1',settings:'panneaux_settings_v1',exams:'panneaux_exam_history_v1',games:'panneaux_game_history_v1',gameSession:'panneaux_game_session_v1',daily:'panneaux_daily_session_v1'};
export const DEFAULT_SETTINGS={newPerDay:40,quizLength:10,examLength:20,examThreshold:90,categories:[],includeIncomplete:false,inverseQuestions:false,showCodes:true,animations:true,theme:'auto',flashcardType:'image-meaning',flashcardAnimation:true,flashcardShowCode:true,flashcardShowTraps:true};
function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value&&typeof value===typeof fallback?value:fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value));return value}
export const getProgress=()=>read(KEYS.progress,{});export const saveProgress=value=>write(KEYS.progress,value);
export const getSettings=()=>({...DEFAULT_SETTINGS,...read(KEYS.settings,{})});export const saveSettings=value=>write(KEYS.settings,{...DEFAULT_SETTINGS,...value});
export const getExamHistory=()=>read(KEYS.exams,[]);export const saveExamHistory=value=>write(KEYS.exams,Array.isArray(value)?value.slice(-50):[]);
export const getGameHistory=()=>read(KEYS.games,[]);export const saveGameHistory=value=>write(KEYS.games,Array.isArray(value)?value.slice(-30):[]);
export const getSavedGame=()=>read(KEYS.gameSession,{});export const saveGameSession=value=>write(KEYS.gameSession,value);export const clearSavedGame=()=>localStorage.removeItem(KEYS.gameSession);
export const getDailySession=()=>read(KEYS.daily,{});export const saveDailySession=value=>write(KEYS.daily,value);
export function exportBundle(){return{version:1,exportedAt:new Date().toISOString(),progress:getProgress(),settings:getSettings(),examHistory:getExamHistory(),gameHistory:getGameHistory()}}
export function validateImport(value){return value&&value.version===1&&value.progress&&typeof value.progress==='object'&&value.settings&&typeof value.settings==='object'&&Array.isArray(value.examHistory)}
export function importBundle(value){if(!validateImport(value))throw new Error('Fichier de progression invalide');saveProgress(value.progress);saveSettings(value.settings);saveExamHistory(value.examHistory);if(Array.isArray(value.gameHistory))saveGameHistory(value.gameHistory)}
export function resetAll(){Object.values(KEYS).forEach(key=>localStorage.removeItem(key))}
