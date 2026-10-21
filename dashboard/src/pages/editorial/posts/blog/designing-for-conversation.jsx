// An example of an article with its own body layout. Metadata and placement
// still come from the adjacent JSON file, so About never needs a manual edit.
export default function ConversationDesign({post}) {
  return <div className="ab-frame ed-designed-body">
    <div className="ed-designed-intro"><p className="ab-label">Design notes</p><h2>The interface should<br />follow the task.</h2></div>
    <div className="ed-designed-copy">{post.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
    <div className="ed-designed-principles"><section><span>01</span><h3>Keep context visible.</h3><p>Let people see the request, the information being used, and what happens next.</p></section><section><span>02</span><h3>Make actions clear.</h3><p>A conversation should make the work easier to follow. Show the step and its result in plain language.</p></section></div>
  </div>;
}
