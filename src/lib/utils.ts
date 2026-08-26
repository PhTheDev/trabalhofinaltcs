export const byId = <T extends { id: number }>(
  arr: T[],
  id: number | string,
): T | undefined => arr.find((item) => String(item.id) === String(id));

export const formatPreco = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const toYoutubeEmbed = (url: string) => {
  if (url.includes('youtube.com/embed/')) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  return url;
};

export const isYoutubeUrl = (url: string) =>
  /youtube\.com|youtu\.be/i.test(url);
