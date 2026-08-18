<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\KategoriBarang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarangController extends Controller
{
    public function index()
    {
        $barang = Barang::with('kategori')
            ->latest()
            ->get();

        $kategori = KategoriBarang::orderBy('nama_kategori')
            ->get();

        return Inertia::render('Barang/Index', [
            'barang' => $barang,
            'kategori' => $kategori,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_barang_id' => 'required|exists:kategori_barang,id',
            'kode_barang' => 'required|string|max:255|unique:barang,kode_barang',
            'nama_barang' => 'required|string|max:255',
            'lokasi' => 'required|string|max:255',
            'kondisi' => 'required|string|max:255',
            'status' => 'required|in:Tersedia,Dipinjam,Maintenance',
        ]);

        Barang::create($validated);

        return redirect()
            ->route('barang.index')
            ->with('success', 'Barang berhasil ditambahkan.');
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'kategori_barang_id' => 'required|exists:kategori_barang,id',
            'kode_barang' => 'required|string|max:255|unique:barang,kode_barang,' . $barang->id,
            'nama_barang' => 'required|string|max:255',
            'lokasi' => 'required|string|max:255',
            'kondisi' => 'required|string|max:255',
            'status' => 'required|in:Tersedia,Dipinjam,Maintenance',
        ]);

        $barang->update($validated);

        return redirect()
            ->route('barang.index')
            ->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy(Barang $barang)
    {
        $barang->delete();

        return redirect()
            ->route('barang.index')
            ->with('success', 'Barang berhasil dihapus.');
    }

    public function show(Barang $barang)
    {
        $barang->load('kategori');

        return Inertia::render('Barang/Detail', [
            'barang' => $barang,
        ]);
    }
}