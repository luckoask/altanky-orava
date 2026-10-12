<?php

namespace App\Mail;

use Illuminate\Http\UploadedFile;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * An inquiry from the website. It is sent during the request (never queued), because the photos are attached
 * straight from their temporary uploads and nothing is stored on the server.
 */
class InquiryReceived extends Mailable
{
    /**
     * @param  array{name: string, phone: ?string, email: ?string, type: ?string, size: ?string, place: ?string, message: ?string}  $inquiry
     * @param  array<int, UploadedFile>  $photos
     */
    public function __construct(public array $inquiry, public array $photos = []) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Dopyt z webu: '.implode(' · ', array_filter([$this->inquiry['type'], $this->inquiry['name'], $this->inquiry['place']])),
            replyTo: $this->inquiry['email'] ? [new Address($this->inquiry['email'], $this->inquiry['name'])] : [],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.inquiry', text: 'mail.inquiry-text');
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return collect($this->photos)->values()->map(fn (UploadedFile $photo, int $index) => Attachment::fromPath($photo->getRealPath())
            ->as(sprintf('fotka-%d.%s', $index + 1, $photo->guessExtension() ?: 'jpg'))
            ->withMime($photo->getMimeType() ?: 'application/octet-stream'))->all();
    }
}
