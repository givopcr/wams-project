<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('barang', function (Blueprint $table) {
            $table->id();
            $table->string('nama_barang');
            $table->foreignId('kategori_id')->constrained('kategori_barang')->onDelete('cascade');
            $table->string('detail')->nullable(); // contoh: jenis resistor, panjang kabel, dll
            $table->enum('status', ['tersedia', 'dipinjam', 'maintenance'])->default('tersedia');
            $table->string('qr_code')->unique()->nullable(); // isi kode unik utk QR
            $table->string('kondisi')->default('baik'); // baik/rusak, diupdate saat pengembalian
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangs');
    }
};
