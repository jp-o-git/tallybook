export default function PageLabel({
  Heading,
  SubHeading,
}: {
  Heading: string
  SubHeading: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="label text-xs font-semibold uppercase tracking-[0.12em]">
        {SubHeading}
      </p>
      <h1>{Heading}</h1>
    </div>
  )
}
