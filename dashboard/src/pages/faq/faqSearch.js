export function searchWords(value) {
  return String(value || "").normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

// The authored catalog is stable. Cache normalization so every keystroke
// doesn't reprocess all answer paragraphs as the FAQ grows.
const indices = new WeakMap();
function searchText(topic,item) {
  let index = indices.get(topic);
  if (!index) { index = new WeakMap(); indices.set(topic,index); }
  let text = index.get(item);
  if (text === undefined) {
    text = searchWords([topic.title,item.question,...item.answers,item.keywords || "",...(item.links || []).map(link => link.label)].join(" ")).join(" ");
    index.set(item,text);
  }
  return text;
}

export function filterQuestions(topics,query,topicId="all") {
  const words = searchWords(query);
  return topics.filter(topic => topicId === "all" || topic.id === topicId).map(topic => ({...topic,questions:topic.questions.filter(item => {
    const text = searchText(topic,item);
    return words.every(word => text.includes(word));
  })})).filter(topic => topic.questions.length);
}
