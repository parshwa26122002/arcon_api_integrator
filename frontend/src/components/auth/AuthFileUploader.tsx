import React, { useState } from 'react';
import styled from 'styled-components';
import authImage from '../../assets/authpage.png';
import logoImg from '../../assets/logo.jpeg';

interface Props {
  onAuthenticated: () => void;
}

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: row;
  margin-left: 40px
`;

const LeftSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fb;
  height: 100vh;
  padding: 40px;
`;

const AuthImage = styled.img`
  width: 540px;
  max-width: 95vw;
  height: auto;
  border-radius: 2rem;
`;

const LeftTitle = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: black;
  text-align: center;
  margin-top: 0.5rem;
  letter-spacing: -1px;
  text-shadow: 0 2px 8px rgba(255, 45, 45, 0.10);
  font-family: 'Inter', sans-serif;
`;

const RightSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  background: #fff;
`;

const Card = styled.div`
  background: transparent;
  border-radius: 0;
  padding: 0;
  max-width: 420px;
  width: 100%;
  min-height: unset;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.2rem;
  box-shadow: none;
  margin-top: 0;
  justify-content: flex-start;
`;

const FormHeading = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.2rem;
  letter-spacing: -0.5px;
`;

const Divider = styled.div`
  width: 400px;
  height: 3px;
  background: #f8bdb7;
  border-radius: 8px;
  margin: 0 0 1.2rem 0;
  opacity: 0.7;
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 70%;
  gap: 0.5rem;
`;

const FileButton = styled.label`
  display: block;
  background: #f5f5f5;
  color: #222;
  font-weight: 600;
  padding: 0.75rem 0;
  font-size: 1rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  width: 400px;
  text-align: center;
  margin-bottom: 0;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0;
  &:hover {
    background: #e0e0e0;
    color: #111;
    transform: translateY(-2px) scale(1.01);
  }
`;

const FileName = styled.div`
  color: #888;
  font-size: 0.95rem;
  margin-top: 0.2rem;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SubmitButton = styled.button`
  background: #f44336;
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 0;
  padding: 0.7rem 0;
  font-size: 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  width: 400PX;
  text-align: center;
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: #b31217;
    transform: translateY(-2px) scale(1.01);
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

const PageHeader = styled.div`
  width: 100vw;
  display: flex;
  align-items: center;
  padding: 32px 0 0 48px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  @media (max-width: 900px) {
    justify-content: center;
    padding: 24px 0 0 0;
    position: static;
  }
`;

const LogoIcon = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 16px;
  margin-right: 5px;
`;

const LogoText = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: black;
  font-family: 'ui-sans-serif;
  letter-spacing: -1px;
  user-select: none;
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
    <>
      <PageHeader>
        <LogoIcon src={logoImg} alt="Logo" />
        <LogoText>| AAI</LogoText>
      </PageHeader>
      <PageWrapper>
        <LeftSide>
          <AuthImage src={authImage} alt="Arcon Auth" />
          <LeftTitle>Arcon API Integrator</LeftTitle>
          <div style={{ color: '#888', marginTop: 4, fontSize: '1rem', fontWeight: 400 }}>Light weight API testing tool</div>
        </LeftSide>
        <RightSide>
          <Card>
            <FormHeading>Welcome back!</FormHeading>
            <Divider />
            <FileInputWrapper>
              <FileButton htmlFor="auth-file-input">Please upload your authentication file</FileButton>
              <HiddenInput
                id="auth-file-input"
                type="file"
                onChange={e => {
                  const files = e.target.files;
                  if (files && files[0]) setFile(files[0]);
                }}
              />
              {file && <FileName>{file.name}</FileName>}
            </FileInputWrapper>
            <SubmitButton onClick={handleLogin}>Submit</SubmitButton>
            <Note>Your auth file will be verified securely.</Note>
          </Card>
        </RightSide>
      </PageWrapper>
    </>
  );
}