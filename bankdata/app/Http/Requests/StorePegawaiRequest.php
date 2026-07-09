<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('kepegawaian.tambah');
    }

    public function rules(): array
    {
        return [
            'nip' => ['required', 'digits_between:10,20', 'unique:pegawai,nip'],
            'nama' => ['required', 'string', 'max:150'],
            'jabatan' => ['required', 'string', 'max:150'],
            'golongan' => ['nullable', 'string', 'max:10'],
            'unit_kerja' => ['required', 'string', 'max:150'],
            'pendidikan_terakhir' => ['nullable', 'string', 'max:100'],
            'tmt_jabatan' => ['nullable', 'date'],
            'status' => ['required', 'in:aktif,pensiun,mutasi,nonaktif'],
            'dokumen_sk' => ['nullable', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }

    public function messages(): array
    {
        return [
            'nip.digits_between' => 'NIP harus berupa angka 10-20 digit.',
            'nip.unique' => 'NIP ini sudah terdaftar di sistem.',
            'dokumen_sk.max' => 'Ukuran dokumen maksimal 5MB.',
        ];
    }
}
