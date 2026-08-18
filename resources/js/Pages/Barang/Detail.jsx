import { Head, Link } from '@inertiajs/react';

export default function Detail({ barang }) {
    return (
        <>
            <Head title={`Detail ${barang.nama_barang}`} />

            <div className="p-6">
                <Link
                    href="/barang"
                    className="text-blue-600"
                >
                    ← Kembali
                </Link>

                <div className="mt-6 rounded-lg border p-6">
                    <h1 className="text-2xl font-bold">
                        {barang.nama_barang}
                    </h1>

                    <div className="mt-4 space-y-2">
                        <p>
                            <strong>Kode:</strong>{' '}
                            {barang.kode_barang}
                        </p>

                        <p>
                            <strong>Kategori:</strong>{' '}
                            {barang.kategori?.nama_kategori}
                        </p>

                        <p>
                            <strong>Lokasi:</strong>{' '}
                            {barang.lokasi}
                        </p>

                        <p>
                            <strong>Kondisi:</strong>{' '}
                            {barang.kondisi}
                        </p>

                        <p>
                            <strong>Status:</strong>{' '}
                            {barang.status}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}