<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('kepegawaian.ubah');
    }

    public function rules(): array
    {
        $id = $this->route('pegawai')->id;

        return [
            'nip' => ['required', 'digits_between:10,20', Rule::unique('pegawai', 'nip')->ignore($id)],
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
}
