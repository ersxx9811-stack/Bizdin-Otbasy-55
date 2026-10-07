// Серверге сұраныстар (Node сервері: server/server.mjs)
export interface ApiPhoto { id: string; topicId: string; name: string; w: number; h: number; at: string; url: string; thumb: string }
export interface ApiTopic { id: string; sectionId: string; name: string; count: number; cover: string | null }
export interface ApiSection { id: string; name: string; topics: ApiTopic[] }

export class ApiError extends Error { constructor(public status: number, msg: string) { super(msg); } }

async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-App': '1' }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
  } catch { throw new ApiError(0, 'Интернет байланысы жоқ немесе сервер жауап бермей тұр. Қайталап көріңіз.'); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(r.status, data.error || 'Қате шықты. Қайталап көріңіз.');
  return data as T;
}

export const api = {
  me: () => call<{ admin: boolean }>('GET', 'api/me'),
  login: (password: string) => call<{ admin: boolean }>('POST', 'api/login', { password }),
  logout: () => call<{ admin: boolean }>('POST', 'api/logout'),
  albums: () => call<{ sections: ApiSection[] }>('GET', 'api/albums'),
  topic: (id: string) => call<{ topic: { id: string; name: string; sectionId: string; sectionName: string }; photos: ApiPhoto[] }>('GET', `api/topics/${id}`),
  addSection: (name: string) => call<{ id: string; name: string }>('POST', 'api/sections', { name }),
  renameSection: (id: string, name: string) => call('PATCH', `api/sections/${id}`, { name }),
  deleteSection: (id: string) => call('DELETE', `api/sections/${id}`),
  addTopic: (sid: string, name: string) => call('POST', `api/sections/${sid}/topics`, { name }),
  renameTopic: (id: string, name: string) => call('PATCH', `api/topics/${id}`, { name }),
  deleteTopic: (id: string) => call('DELETE', `api/topics/${id}`),
  deletePhoto: (id: string) => call('DELETE', `api/photos/${id}`),
};

/** Прогресі бар жүктеу (XHR) */
function put<T>(url: string, blob: Blob, onProgress?: (f: number) => void): Promise<T> {
  return new Promise((ok, no) => {
    const x = new XMLHttpRequest();
    x.open('PUT', url); x.setRequestHeader('X-App', '1'); x.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
    x.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    x.onerror = () => no(new ApiError(0, 'Байланыс үзілді. Интернетті тексеріп, қайталаңыз.'));
    x.ontimeout = () => no(new ApiError(0, 'Жүктеу тым ұзаққа созылды.'));
    x.onload = () => {
      let d: any = {}; try { d = JSON.parse(x.responseText); } catch {}
      x.status >= 200 && x.status < 300 ? ok(d as T) : no(new ApiError(x.status, d.error || 'Фото жүктелмеді'));
    };
    x.send(blob);
  });
}

async function decode(file: File): Promise<{ draw: (c: HTMLCanvasElement, w: number, h: number) => void; w: number; h: number }> {
  if ('createImageBitmap' in window) {
    try { const b = await createImageBitmap(file); return { w: b.width, h: b.height, draw: (c, w, h) => c.getContext('2d')!.drawImage(b, 0, 0, w, h) }; } catch { /* төменге өтеміз */ }
  }
  const u = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('decode')); i.src = u; });
    return { w: img.naturalWidth, h: img.naturalHeight, draw: (c, w, h) => c.getContext('2d')!.drawImage(img, 0, 0, w, h) };
  } finally { setTimeout(() => URL.revokeObjectURL(u), 3000); }
}
const encode = async (d: Awaited<ReturnType<typeof decode>>, max: number, q: number) => {
  const k = Math.min(1, max / Math.max(d.w, d.h)); const w = Math.round(d.w * k), h = Math.round(d.h * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h; d.draw(c, w, h);
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/jpeg', q));
  c.width = c.height = 0; if (!blob) throw new Error('encode'); return blob;
};

/** Фотоны (пропорциясын бұзбай) кішірейтіп, толық нұсқа мен нобайды серверге жүктейді */
export async function uploadPhoto(topicId: string, file: File, onProgress: (f: number) => void): Promise<ApiPhoto> {
  if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) throw new ApiError(0, `«${file.name}» — фото емес`);
  let full: Blob, thumb: Blob, w: number, h: number;
  try {
    const d = await decode(file); w = d.w; h = d.h;
    const k = Math.min(1, 2400 / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
    full = await encode(d, 2400, 0.88); thumb = await encode(d, 720, 0.82);
  } catch { throw new ApiError(0, `«${file.name}» файлын оқи алмадым. JPG, PNG немесе WEBP форматын таңдаңыз.`); }
  const q = new URLSearchParams({ name: file.name, w: String(w), h: String(h) });
  const ph = await put<ApiPhoto>(`api/topics/${topicId}/photos?${q}`, full, (f) => onProgress(f * 0.85));
  try { return await put<ApiPhoto>(`api/photos/${ph.id}/thumb`, thumb, (f) => onProgress(0.85 + f * 0.15)); } catch { return ph; }
}
