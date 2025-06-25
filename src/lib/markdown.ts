// Función simple para renderizar markdown básico en los mensajes del chatbot
export function renderMarkdown(text: string): string {
  if (!text) return text;

  let rendered = text;

  // **Texto en negrita**
  rendered = rendered.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // *Texto en cursiva*
  rendered = rendered.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // `Código inline`
  rendered = rendered.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>'
  );

  // # Títulos
  rendered = rendered.replace(
    /^# (.*$)/gm,
    '<h1 class="text-lg font-bold mb-2">$1</h1>'
  );
  rendered = rendered.replace(
    /^## (.*$)/gm,
    '<h2 class="text-md font-semibold mb-1">$1</h2>'
  );
  rendered = rendered.replace(
    /^### (.*$)/gm,
    '<h3 class="text-sm font-medium mb-1">$1</h3>'
  );

  // - Lista con viñetas
  rendered = rendered.replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');

  // URLs básicas (opcional)
  rendered = rendered.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="text-blue-600 dark:text-blue-400 underline">$1</a>'
  );

  // Saltos de línea dobles -> párrafos
  rendered = rendered.replace(/\n\n/g, '</p><p class="mb-2">');
  rendered = `<p class="mb-2">${rendered}</p>`;

  return rendered;
}

// Función alternativa para renderizar texto plano sin markdown
export function renderPlainText(text: string): string {
  if (!text) return text;

  // Simplemente remover los asteriscos pero mantener el texto
  let cleaned = text;
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1"); // Quitar **
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1"); // Quitar *
  cleaned = cleaned.replace(/`(.*?)`/g, "$1"); // Quitar `

  return cleaned;
}
