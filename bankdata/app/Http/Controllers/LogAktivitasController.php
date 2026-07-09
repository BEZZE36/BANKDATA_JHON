<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Models\User;

class LogAktivitasController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified', 'role:admin']);
    }

    public function index(Request $request)
    {
        $activities = Activity::with('causer')
            ->when($request->get('modul'), fn($q, $m) => $q->where('log_name', $m))
            ->when($request->get('user_id'), fn($q, $u) => $q->where('causer_id', $u))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $modules = Activity::select('log_name')->distinct()->pluck('log_name');
        $users = User::orderBy('name')->pluck('name', 'id');

        return view('log-aktivitas.index', compact('activities', 'modules', 'users'));
    }
}
