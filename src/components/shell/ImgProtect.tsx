'use client';
// 이미지 저장 방지 + 사이트 전체 우클릭/드래그 방지.
// 관리자 계정은 보호 기능에서 제외.
// 메모 포스트잇의 pointer 기반 이동은 그대로 유지한다.
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMenuSettings, imgProtectAreaFor } from '@/lib/menuStore';
import { useAuth } from '@/lib/auth';

export function ImgProtect() {
const pathname = usePathname();
const [ms] = useMenuSettings();
const { isAdmin } = useAuth();
const area = imgProtectAreaFor(pathname ?? '');
const imgProtectActive =
!isAdmin && !!area && (ms.imgProtect ?? []).includes(area);

useEffect(() => {
if (isAdmin) return;

```
// 브라우저 기본 우클릭 메뉴 차단.
// 메모의 커스텀 우클릭 메뉴는 그대로 사용할 수 있게 예외 처리.
const onCtx = (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;

  if (
    target?.closest('.postit, .memo-list-item, .ctx-menu')
  ) {
    return;
  }

  e.preventDefault();
};

// 일반 HTML 드래그(특히 이미지 끌어가기) 차단.
// 메모 이동은 pointer 이벤트를 사용하므로 영향을 주지 않는다.
const onDrag = (e: DragEvent) => {
  e.preventDefault();
};

document.addEventListener('contextmenu', onCtx);
document.addEventListener('dragstart', onDrag);

document.documentElement.classList.add('img-protect-on');

return () => {
  document.removeEventListener('contextmenu', onCtx);
  document.removeEventListener('dragstart', onDrag);
  document.documentElement.classList.remove('img-protect-on');
};
```

}, [isAdmin]);

useEffect(() => {
if (!imgProtectActive) return;

```
// 메뉴에서 이미지 보호를 켠 영역에서는
// 이미지 우클릭/드래그를 확실하게 차단한다.
const isImg = (t: EventTarget | null) =>
  t instanceof HTMLElement && t.tagName === 'IMG';

const onCtxImg = (e: MouseEvent) => {
  if (isImg(e.target)) e.preventDefault();
};

const onDragImg = (e: DragEvent) => {
  if (isImg(e.target)) e.preventDefault();
};

document.addEventListener('contextmenu', onCtxImg);
document.addEventListener('dragstart', onDragImg);

return () => {
  document.removeEventListener('contextmenu', onCtxImg);
  document.removeEventListener('dragstart', onDragImg);
};
```

}, [imgProtectActive]);

return null;
}
