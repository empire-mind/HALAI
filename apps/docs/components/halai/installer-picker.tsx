'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { HALAI_PRODUCT } from '../../../../shared/halai-product';

const platformNotes = {
  macOS: 'Check the release notes for Apple silicon or Intel support and signing details.',
  Windows: 'Check the release notes for the supported Windows version and installer type.',
  Ubuntu: 'Use the source setup or review the self-hosting guide for a server you control.',
} as const;

type Platform = keyof typeof platformNotes;

export function InstallerPicker() {
  const [platform, setPlatform] = useState<Platform>('macOS');
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();

  return (
    <>
      <button ref={opener} className="halai-button" type="button" onClick={() => dialog.current?.showModal()}>
        Choose a platform
      </button>
      <dialog ref={dialog} className="halai-dialog" aria-labelledby={heading} onClose={() => opener.current?.focus()}>
        <h2 id={heading}>Install HALAI</h2>
        <fieldset>
          <legend>Platform</legend>
          {(Object.keys(platformNotes) as Platform[]).map((choice) => (
            <label className="halai-choice" key={choice}>
              <input type="radio" name="platform" checked={platform === choice} onChange={() => setPlatform(choice)} />
              {choice}
            </label>
          ))}
        </fieldset>
        <p role="status">{platformNotes[platform]}</p>
        <div className="halai-actions">
          <Link className="halai-button" href="/docs/getting-started/installation">Installation guide</Link>
          <a className="halai-text-link" href={`${HALAI_PRODUCT.repository}/releases`}>HALAI releases</a>
          <form method="dialog"><button className="halai-text-link" type="submit">Close</button></form>
        </div>
      </dialog>
    </>
  );
}
