import { Head } from '@inertiajs/react';

export default function Index({ barang }) {
    return (
        <>
            <Head title="Data Barang" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Data Barang
                </h1>

                <div className="mt-6 overflow-hidden rounded-lg border">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-100">
                                <th className="p-3 text-left">
                                    Kode
                                </th>

                                <th className="p-3 text-left">
                                    Nama Barang
                                </th>

                                <th className="p-3 text-left">
                                    Kategori
                                </th>

                                <th className="p-3 text-left">
                                    Lokasi
                                </th>

                                <th className="p-3 text-left">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {barang.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b"
                                >
                                    <td className="p-3">
                                        {item.kode_barang}
                                    </td>

                                    <td className="p-3">
                                        {item.nama_barang}
                                    </td>

                                    <td className="p-3">
                                        {item.kategori?.nama_kategori}
                                    </td>

                                    <td className="p-3">
                                        {item.lokasi}
                                    </td>

                                    <td className="p-3">
                                        {item.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}