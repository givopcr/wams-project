import { Head } from '@inertiajs/react';

export default function Index({ kategori }) {
    return (
        <>
            <Head title="Kategori Barang" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Kategori Barang
                </h1>

                <div className="mt-6">
                    {kategori.map((item) => (
                        <div
                            key={item.id}
                            className="border-b py-3"
                        >
                            {item.nama_kategori}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}