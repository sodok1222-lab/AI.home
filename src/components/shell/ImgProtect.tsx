'use client';

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
    !isAdmin &&
    !!area &&
    (ms.imgProtect ?? []).includes(area);

  useEffect(() => {
    if (isAdmin) return;

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      if (
        target?.closest('.postit') ||
        target?.closest('.memo-list-item') ||
        target?.closest('.ctx-menu')
      ) {
        return;
      }

      e.preventDefault();
    };

    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!imgProtectActive) return;

    const isImage = (target: EventTarget | null) => {
      return target instanceof HTMLElement && target.tagName === 'IMG';
    };

    const onImageContextMenu = (e: MouseEvent) => {
      if (isImage(e.target)) {
        e.preventDefault();
      }
    };

    const onImageDragStart = (e: DragEvent) => {
      if (isImage(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', onImageContextMenu);
    document.addEventListener('dragstart', onImageDragStart);

    document.documentElement.classList.add('img-protect-on');

    return () => {
      document.removeEventListener('contextmenu', onImageContextMenu);
      document.removeEventListener('dragstart', onImageDragStart);
      document.documentElement.classList.remove('img-protect-on');
    };
  }, [imgProtectActive]);

  return null;
}
