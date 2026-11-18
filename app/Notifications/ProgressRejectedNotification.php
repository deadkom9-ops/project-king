<?php

namespace App\Notifications;

use App\Models\ProgressUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProgressRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ProgressUpdate $progress
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Progress Ditolak',
            'message' => "Progress {$this->progress->percentage}% untuk task \"{$this->progress->task->title}\" ditolak. Alasan: {$this->progress->rejection_reason}",
            'progress_id' => $this->progress->id,
            'task_id' => $this->progress->task_id,
            'project_id' => $this->progress->task->project_id,
            'type' => 'progress_rejected',
        ];
    }
}
