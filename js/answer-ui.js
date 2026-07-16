import{escapeHtml}from'./utils.js';

export function answerButtons(options,{name='answer',selected=null,exam=false}={}){
  return options.map(option=>{
    const value=String(option.value??option.code);
    const label=String(option.label??option.name);
    const chosen=selected!=null&&String(selected)===value;
    return `<button type="button" class="answer${chosen?exam?' exam-selected':' selected':''}" data-answer-value="${escapeHtml(value)}" aria-pressed="${chosen?'true':'false'}" name="${escapeHtml(name)}">${escapeHtml(label)}</button>`;
  }).join('');
}

export function selectAnswer(container,button,{exam=false}={}){
  container.querySelectorAll('[data-answer-value]').forEach(item=>{
    const chosen=item===button;
    item.classList.toggle('selected',chosen&&!exam);
    item.classList.toggle('exam-selected',chosen&&exam);
    item.setAttribute('aria-pressed',String(chosen));
  });
  return button.dataset.answerValue;
}

export function revealAnswer(container,{selected,correct}){
  container.querySelectorAll('[data-answer-value]').forEach(item=>{
    const value=item.dataset.answerValue;
    item.disabled=true;
    item.classList.remove('selected','exam-selected');
    item.classList.toggle('correct',value===String(correct));
    item.classList.toggle('incorrect',value===String(selected)&&value!==String(correct));
    item.setAttribute('aria-pressed',String(value===String(selected)));
  });
}
