'use client';

// 일기 작성/수정 공용 폼 (4.14)
// 제목 · 날짜 · 무드 · 내용(MD) · 이미지 · 공개범위

import React, { useState } from 'react';
import {
  DiaryPost,
  Mood,
  moodTint,
} from '@/lib/diaryStore';
import { Visibility } from '@/lib/charStore';
import { newId } from '@/lib/postStore';
import {
  KInput,
  KTextarea,
  KSelect,
  KDate,
} from '@/components/ui/Kit';
import { DragList } from '@/components/ui/DragList';
import { useConfirmDelete } from '@/components/ui/Modal';
import {
  putBlob,
  useBlobUrl,
  BlobImg,
} from '@/lib/blobStore';
import { useToast } from '@/components/ui/Toast';

export interface DiaryFormValue {
  title: string;
  date: string;
  moodId: string;
  body: string;
  imgIds: string[];
  visibility: Visibility;
}

interface ImgItem {
  id: string;
  ref?: string;
  url?: string;
  file?: File;
}

function ImgThumb({ item }: { item: ImgItem }) {
  const loaded = useBlobUrl(item.ref);
  const src = item.url ?? loaded;

  // eslint-disable-next-line @next/next/no-img-element
  return src ? (
    <img
      src={src}
      alt=""
      style={{
        width: 64,
        height: 48,
        objectFit: 'cover',
        borderRadius: 6,
      }}
    />
  ) : null;
}

export function DiaryForm({
  initial,
  moods,
  setMoods,
  onSave,
  onCancel,
}: {
  initial: DiaryPost | null;
  moods: Mood[];
  setMoods: (next: Mood[]) => void;
  onSave: (v: DiaryFormValue) => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const del = useConfirmDelete();

  const isNew = !initial;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = [year, month, day].join('-');

  const [title, setTitle] = useState(
    initial?.title ?? ''
  );

  const [date, setDate] = useState(
    initial?.date ?? todayStr
  );

  const [moodId, setMoodId] = useState(
    initial?.moodId ?? moods[0]?.id ?? ''
  );

  const [moodManagerOpen, setMoodManagerOpen] =
    useState(false);

  const [body, setBody] = useState(
    initial?.body ?? ''
  );

  const [imgs, setImgs] = useState<ImgItem[]>(() =>
    (initial?.imgIds ?? []).map(ref => ({
      id: newId(),
      ref,
    }))
  );

  const [visibility, setVisibility] =
    useState<Visibility>(
      initial?.visibility ?? 'public'
    );

  const save = async () => {
    if (!title.trim()) {
      toast('제목을 입력해 주세요');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast(
        '날짜를 YYYY-MM-DD 형식으로 입력해 주세요'
      );
      return;
    }

    const imgIds = await Promise.all(
      imgs.map(item =>
        item.file
          ? putBlob(item.file)
          : Promise.resolve(item.ref!)
      )
    );

    onSave({
      title: title.trim(),
      date,
      moodId,
      body,
      imgIds,
      visibility,
    });
  };

  /* ---------- 무드 관리 ---------- */

  const updateMood = (
    id: string,
    patch: Partial<Mood>
  ) => {
    setMoods(
      moods.map(mood =>
        mood.id === id
          ? { ...mood, ...patch }
          : mood
      )
    );
  };

  const addMood = () => {
    const next: Mood = {
      id: newId(),
      name: '새 무드',
      icon: '☀️',
      color: '#888888',
    };

    setMoods([...moods, next]);
    setMoodId(next.id);
  };

  const removeMood = (id: string) => {
    if (moods.length <= 1) {
      toast('무드는 최소 1개 이상 필요해요');
      return;
    }

    del.ask(
      '이 무드를 삭제하시겠습니까?',
      () => {
        const next = moods.filter(
          mood => mood.id !== id
        );

        setMoods(next);

        if (moodId === id) {
          setMoodId(next[0]?.id ?? '');
        }
      }
    );
  };

  return (
    <div className="write-grid">
      {/* ---------- 왼쪽: 작성 영역 ---------- */}

      <div
        className="panel"
        style={{
          padding: 24,
          display: 'grid',
          gap: 12,
          alignContent: 'start',
        }}
      >
        {/* 제목 / 날짜 */}

        <div
          style={{
            display: 'flex',
            gap: 8,
          }}
        >
          <KInput
            placeholder="제목"
            value={title}
            onChange={e =>
              setTitle(e.target.value)
            }
            style={{ flex: 1 }}
          />

          <KDate
            value={date}
            onChange={setDate}
            style={{ maxWidth: 130 }}
          />
        </div>

        {/* ---------- 무드 ---------- */}

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <label
              className="k-label"
              style={{ margin: 0 }}
            >
              무드
            </label>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setMoodManagerOpen(
                  value => !value
                )
              }
              style={{
                padding: '3px 9px',
                fontSize: 11,
              }}
            >
              {moodManagerOpen
                ? '－ 무드 닫기'
                : '＋ 무드 관리'}
            </button>
          </div>

          {/* 무드 선택 */}

          <div
            style={{
              display: 'flex',
              gap: 7,
              flexWrap: 'wrap',
            }}
          >
            {moods.map(mood => (
              <button
                key={mood.id}
                type="button"
                className="mood-pick"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 13px',
                  borderRadius: 999,
                  border:
                    '1.5px solid ' +
                    (moodId === mood.id
                      ? mood.color
                      : 'var(--line)'),
                  background:
                    moodId === mood.id
                      ? moodTint(mood.color)
                      : 'transparent',
                  fontSize: 12,
                  transition: '.15s',
                }}
                onClick={() =>
                  setMoodId(mood.id)
                }
              >
                {mood.iconImage ? (
                  <BlobImg
                    fileRef={mood.iconImage}
                    ph=""
                    imgStyle={{
                      width: 24,
                      height: 24,
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: mood.color,
                    }}
                  >
                    {mood.icon}
                  </span>
                )}

                {mood.name}
              </button>
            ))}
          </div>

          {/* ---------- 무드 관리 패널 ---------- */}

          {moodManagerOpen && (
            <div
              style={{
                marginTop: 12,
                padding: 14,
                border:
                  '1px solid var(--line)',
                borderRadius: 10,
                background:
                  'var(--panel, transparent)',
                display: 'grid',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    무드 관리
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 10,
                      color:
                        'var(--muted)',
                    }}
                  >
                    이름, 아이콘, 색상을
                    자유롭게 바꿀 수 있어요.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={addMood}
                  style={{
                    padding: '5px 10px',
                    fontSize: 11,
                  }}
                >
                  ＋ 무드 추가
                </button>
              </div>

              {/* 무드 목록 */}

              <div
                style={{
                  display: 'grid',
                  gap: 8,
                }}
              >
                {moods.map(mood => (
                  <div
                    key={mood.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '36px minmax(90px, 1fr) 82px 44px 28px',
                      gap: 7,
                      alignItems: 'center',
                    }}
                  >
                    {/* 아이콘 미리보기 */}

                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          moodTint(
                            mood.color
                          ),
                        overflow: 'hidden',
                        fontSize: 17,
                      }}
                    >
                      {mood.iconImage ? (
                        <BlobImg
                          fileRef={
                            mood.iconImage
                          }
                          ph=""
                          imgStyle={{
                            width: 32,
                            height: 32,
                            objectFit: 'cover',
                            borderRadius:
                              '50%',
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color:
                              mood.color,
                          }}
                        >
                          {mood.icon}
                        </span>
                      )}
                    </div>

                    {/* 이름 */}

                    <KInput
                      value={mood.name}
                      onChange={e =>
                        updateMood(
                          mood.id,
                          {
                            name:
                              e.target.value,
                          }
                        )
                      }
                      placeholder="무드 이름"
                    />

                    {/* 아이콘 / 사진 */}

<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  }}
>
  <KInput
    value={mood.icon}
    onChange={e =>
      updateMood(
        mood.id,
        {
          icon: e.target.value,
        }
      )
    }
    placeholder="☀️"
    style={{
      textAlign: 'center',
      width: 44,
    }}
  />

  <label
    title="무드 사진"
    style={{
      width: 30,
      height: 30,
      border: '1px solid var(--line)',
      borderRadius: 6,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      overflow: 'hidden',
      flexShrink: 0,
    }}
  >
    {mood.iconImage ? (
      <BlobImg
        fileRef={mood.iconImage}
        ph="＋"
        imgStyle={{
          width: 30,
          height: 30,
          objectFit: 'cover',
        }}
      />
    ) : (
      <span style={{ fontSize: 12 }}>📷</span>
    )}

    <input
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={async e => {
        const file = e.target.files?.[0];

        if (!file) return;

        const ref = await putBlob(file);

        updateMood(
          mood.id,
          {
            iconImage: ref,
          }
        );

        e.target.value = '';
      }}
    />
  </label>
</div>

                    {/* 색상 */}

                    <input
                      type="color"
                      value={mood.color}
                      onChange={e =>
                        updateMood(
                          mood.id,
                          {
                            color:
                              e.target.value,
                          }
                        )
                      }
                      title="무드 색상"
                      style={{
                        width: 36,
                        height: 30,
                        padding: 2,
                        border:
                          '1px solid var(--line)',
                        borderRadius: 6,
                        background:
                          'transparent',
                        cursor: 'pointer',
                      }}
                    />

                    {/* 삭제 */}

                    <button
                      type="button"
                      className="fx"
                      onClick={() =>
                        removeMood(mood.id)
                      }
                      title="무드 삭제"
                      style={{
                        border: 0,
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------- 본문 ---------- */}

        <div>
          <label
            className="k-label"
            style={{ marginBottom: 6 }}
          >
            내용 — 마크다운 지원
          </label>

          <KTextarea
            value={body}
            onChange={e =>
              setBody(e.target.value)
            }
            style={{ minHeight: 180 }}
          />
        </div>

        {/* ---------- 이미지 ---------- */}

        <label
          className="k-label"
          style={{ margin: 0 }}
        >
          이미지 (선택) — 본문 아래에 순서대로
          표시 · ⠿ 순서
        </label>

        {imgs.length > 0 && (
          <DragList
            items={imgs}
            keyOf={item => item.id}
            onReorder={setImgs}
            render={item => (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  width: '100%',
                  padding: '3px 0',
                }}
              >
                <span className="drag-h">
                  ⠿
                </span>

                <ImgThumb item={item} />

                <span
                  className="fx"
                  style={{
                    marginLeft: 'auto',
                  }}
                  onClick={() =>
                    del.ask(
                      '이 이미지를 빼시겠습니까?',
                      () =>
                        setImgs(current =>
                          current.filter(
                            image =>
                              image.id !==
                              item.id
                          )
                        )
                    )
                  }
                >
                  ✕
                </span>
              </div>
            )}
          />
        )}

        <input
          id="dyImgF"
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => {
            const list = e.target.files;

            if (list) {
              setImgs(previous => [
                ...previous,
                ...Array.from(list).map(
                  file => ({
                    id: newId(),
                    url: URL.createObjectURL(
                      file
                    ),
                    file,
                  })
                ),
              ]);
            }

            e.target.value = '';
          }}
        />

        <button
          type="button"
          className="btn btn-ghost"
          style={{
            padding: '5px 12px',
            fontSize: 11,
            justifySelf: 'center',
          }}
          onClick={() =>
            document
              .getElementById('dyImgF')
              ?.click()
          }
        >
          ＋ ADD IMAGE
        </button>
      </div>

      {/* ---------- 오른쪽: 공개범위 ---------- */}

      <div>
        <div
          className="panel widget"
          style={{ marginBottom: 14 }}
        >
          <h4>공개범위</h4>

          <KSelect
            value={visibility}
            onChange={value =>
              setVisibility(
                value as Visibility
              )
            }
            options={[
              {
                value: 'public',
                label: '전체공개',
              },
              {
                value: 'member',
                label: '멤버공개',
              },
              {
                value: 'private',
                label: '나만보기',
              },
            ]}
          />

          <p
            className="hint"
            style={{ marginTop: 8 }}
          >
            비공개 일기는 메인 「최근 일기」 위젯에
            절대 노출되지 않습니다
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-onbk"
            onClick={onCancel}
          >
            CANCEL
          </button>

          <button
            type="button"
            className="btn btn-accent"
            onClick={save}
          >
            {isNew ? 'POST' : 'SAVE'}
          </button>
        </div>
      </div>

      {del.element}
    </div>
  );
}
