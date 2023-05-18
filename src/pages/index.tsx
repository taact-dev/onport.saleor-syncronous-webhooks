import Head from 'next/head';
import styles from '@/styles/Home.module.css';

export default function Home() {
    return (
        <>
            <Head>
                <title>Saleor Webhooks</title>
            </Head>
            <main className={styles.main}>
                <div className={styles.description}></div>
            </main>
        </>
    );
}
