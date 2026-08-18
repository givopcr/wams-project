<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    protected $fillable = ['nama_barang', 'kategori_id', 'detail', 'status', 'qr_code', 'kondisi'];

    public function kategori()
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_id');
    }

    public function logbook()
    {
        return $this->hasMany(Logbook::class);
    }
}
