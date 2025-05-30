import React, { useState } from 'react';
import styled from 'styled-components';

interface Props {
  onAuthenticated: () => void;
}

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #23272f 0%, #181a20 100%);
`;

const Card = styled.div`
  background: #23242a;
  border-radius: 2rem;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.25);
  border: 1px solid #33343a;
  padding: 2.5rem 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.img`
  height: 96px;
  width: 96px;
  margin-bottom: 1.5rem;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(255, 0, 0, 0.10));
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 900;
  color: #ff2d2d;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(255, 45, 45, 0.15);
`;

const Divider = styled.div`
  width: 64px;
  height: 4px;
  background: #ff2d2d;
  border-radius: 8px;
  margin: 0 auto 1.5rem auto;
  opacity: 0.5;
`;

const Description = styled.p`
  color: #b0b3bb;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const FileLabel = styled.label`
  cursor: pointer;
  width: 100%;
  display: inline-block;
`;

const FileButton = styled.span`
  display: block;
  background: linear-gradient(90deg, #ff2d2d 0%, #b31217 100%);
  color: #fff;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(255, 45, 45, 0.08);
  margin-bottom: 0.5rem;
  transition: background 0.2s, transform 0.2s;
  font-size: 1rem;
  letter-spacing: 0.5px;
  &:hover {
    background: linear-gradient(90deg, #b31217 0%, #ff2d2d 100%);
    transform: translateY(-2px) scale(1.03);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const Note = styled.p`
  color: #6c6f78;
  font-size: 0.85rem;
  margin-top: 1.25rem;
`;

export default function AuthFileUploader({ onAuthenticated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const isAuthenticated = async (file: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch("http://localhost:4000/api/authenticate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const auth = await isAuthenticated(file);
    if (auth) {
      document.cookie = `authToken=asdfghjigfgvergrurh84t4tvhrnvwvwe8; Max-Age=3600; path=/`;
      onAuthenticated();
    } else {
      alert("Authentication failed.");
    }
  };

  const handleLogin = async () => {
    if (!file) return alert('Please upload a file');

    const buffer = await file.arrayBuffer();
    const iv = buffer.slice(0, 12);
    const data = buffer.slice(12, buffer.byteLength - 16);
    const authTag = buffer.slice(buffer.byteLength - 16);

    try {
      const key = await getKeyFromPassword('MySuperSecretKey', new Uint8Array(iv));
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv),
          tagLength: 128,
        },
        key,
        concatenateBuffers(data, authTag)
      );
      document.cookie = `authToken=asdfghjigfgvergrurh84t4tvhrnvwvwe8; Max-Age=3600; path=/`;
      onAuthenticated();

    } catch (e) {
      console.error('Decryption failed:', e);
      alert('Invalid file');
    }
  };

  const getKeyFromPassword = async (password: string | undefined, salt: Uint8Array<any>) => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  };

  const concatenateBuffers = (a: ArrayBuffer, b: ArrayBuffer) => {
    const tmp = new Uint8Array(a.byteLength + b.byteLength);
    tmp.set(new Uint8Array(a), 0);
    tmp.set(new Uint8Array(b), a.byteLength);
    return tmp.buffer;
  };

  return (
    <PageWrapper>
      <Card>
        <Logo
          src="/logo.png"
          alt="ARCON Logo"
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
        <Title>ARCON API INTEGRATOR</Title>
        <Divider />
        <Description>
          Please upload your authentication file
        </Description>
        <FileLabel>
          <FileButton>Select Auth File</FileButton>
          <input
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files[0]) setFile(files[0]);
            }}
          /><br /><br />
          <button onClick={handleLogin}>Submit</button>
        </FileLabel>
        <Note>Your auth file will be verified securely.</Note>
      </Card>
    </PageWrapper>
  );
}