export default function PageLabel({
  Heading,
  SubHeading,
}: {
  Heading: string
  SubHeading: string
}) {
  return (
    <div className="flex flex-col gap-0">
      <p className="-mb-2 text-xs label font-semibold uppercase">
        {SubHeading}
      </p>
      <h1>{Heading}</h1>
    </div>
  )
}
