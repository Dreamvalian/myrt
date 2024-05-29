<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Reports;

class ReportController extends Controller
{
    public function index()
    {
        $data['report'] = reports::all();
        return view('pages.admin-pages.report-admin', $data);
    }

    public function create()
    {
        return view('pages.user-pages.add-report-user');
    }



    public function store(Request $request)
    {

        // Handle file upload
        $imagePath = 'default.png';
        if ($request->hasFile('picture')) {
            $image = $request->file('picture');
            $imagePath = $image->store('images', 'public'); // Menyimpan file ke direktori 'public/images'
        }

        Reports::create([
            'type_report' => $request->type_report,
            'title' => $request->title,
            'description' => $request->description,
            'date_start' => $request->date_start,
            'date_end' => $request->date_end,
            'picture' => $imagePath,
            'status' => null,
            'user_id' => Auth::id(),
        ]);

        return redirect('home-user')->with('success', 'Activity created successfully');
    }

    public function check($report_id)
    {
        $report = reports::find($report_id);
        if ($report) {
            $report->status = 'checked';
            $report->save();
        }
        return redirect()->back()->with('success', 'Report checked successfully.');
    }

    public function reject($report_id)
    {
        $report = reports::find($report_id);
        if ($report) {
            $report->status = 'rejected';
            $report->save();
        }
        return redirect()->back()->with('success', 'Report rejected successfully.');
    }
}