const escape = (json: string) => json.replace(/</g, '\\u003c');

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escape(JSON.stringify(data)) }}
    />
  );
}
