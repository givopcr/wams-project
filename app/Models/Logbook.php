<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Logbook extends Model
{
     protected $table = 'logbook';
    protected $fillable = ['barang_id', 'user_id', 'waktu_pinjam', 'waktu_kembali', 'status', 'kondisi_saat_kembali'];

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
