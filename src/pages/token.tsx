import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { TokenDashboard } from './components/token';

const TokenPage: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Token Dashboard</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TokenDashboard />
        </div>
      </main>
    </div>
  );
};

export default TokenPage;
