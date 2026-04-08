export function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="col-md-4">
      <div className="card p-3 h-100">
        <h5>{title}</h5>
        <p className="mb-0">{text}</p>
      </div>
    </div>
  );
}
