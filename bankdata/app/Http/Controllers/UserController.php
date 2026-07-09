<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified', 'role:admin']);
    }

    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->get('q'), function($query, $q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return view('pengguna.index', compact('users'));
    }

    public function create()
    {
        $roles = Role::pluck('name', 'name')->all();
        return view('pengguna.create', compact('roles'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'unit_kerja' => 'nullable|string|max:150',
            'is_active' => 'required|boolean',
            'roles' => 'required|array'
        ]);

        $user = clone $request; // just for activity log
        $newUser = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'unit_kerja' => $data['unit_kerja'],
            'is_active' => $data['is_active'],
        ]);

        $newUser->assignRole($data['roles']);

        activity('pengguna')->causedBy($request->user())->performedOn($newUser)
            ->log("Menambah akun pengguna {$newUser->name}");

        return redirect()->route('pengguna.index')->with('sukses', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(User $pengguna)
    {
        $roles = Role::pluck('name', 'name')->all();
        $userRoles = $pengguna->roles->pluck('name', 'name')->all();
        return view('pengguna.edit', compact('pengguna', 'roles', 'userRoles'));
    }

    public function update(Request $request, User $pengguna)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($pengguna->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'unit_kerja' => 'nullable|string|max:150',
            'is_active' => 'required|boolean',
            'roles' => 'required|array'
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'unit_kerja' => $data['unit_kerja'],
            'is_active' => $data['is_active'],
        ];

        if (!empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $pengguna->update($payload);
        $pengguna->syncRoles($data['roles']);

        activity('pengguna')->causedBy($request->user())->performedOn($pengguna)
            ->log("Mengubah data pengguna {$pengguna->name}");

        return redirect()->route('pengguna.index')->with('sukses', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(Request $request, User $pengguna)
    {
        if ($pengguna->id === $request->user()->id) {
            return back()->withErrors(['error' => 'Anda tidak dapat menghapus akun Anda sendiri.']);
        }

        $nama = $pengguna->name;
        $pengguna->delete();

        activity('pengguna')->causedBy($request->user())->log("Menghapus pengguna {$nama}");

        return redirect()->route('pengguna.index')->with('sukses', 'Pengguna berhasil dihapus.');
    }
}
