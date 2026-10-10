const escape = (json: string) => json.replace(/</g, '\\u003c');

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- required by the JSON-LD spec, escaped above
      dangerouslySetInnerHTML={{ __html: escape(JSON.stringify(data)) }}
    />
  );
}
