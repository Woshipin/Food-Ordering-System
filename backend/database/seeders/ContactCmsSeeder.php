<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ContactCms;
use App\Models\ContactFaq;
use App\Models\ContactInfo;
use App\Models\ContactMap;
use Illuminate\Support\Facades\DB;

class ContactCmsSeeder extends Seeder
{
    public function run(): void
    {
        ContactCms::create([
            'contact_title_en' => 'Contact Us',
            'contact_title_zh' => '联系我们',
            'contact_title_ms' => 'Hubungi Kami',
            'contact_description_en' => 'Feel free to reach out to us via any channel.',
            'contact_description_zh' => '欢迎通过任何方式联系我们。',
            'contact_description_ms' => 'Jangan segan untuk hubungi kami.',
        ]);

        ContactFaq::create([
            'question_en' => 'How do I contact support?',
            'question_zh' => '我该如何联系技术支持？',
            'question_ms' => 'Bagaimana cara hubungi sokongan?',
            'answer_en' => 'You can email us at support@example.com.',
            'answer_zh' => '您可以通过 support@example.com 给我们发送邮件。',
            'answer_ms' => 'Anda boleh emel kami di support@example.com.',
        ]);

        ContactInfo::create([
            'type' => 'phone',
            'label_en' => 'Phone',
            'label_zh' => '电话',
            'label_ms' => 'Telefon',
            'value' => '+6012-3456789',
            'note_en' => 'Business hours only',
            'note_zh' => '仅限营业时间',
            'note_ms' => 'Hanya waktu bekerja',
        ]);

        ContactInfo::create([
            'type' => 'email',
            'label_en' => 'Email',
            'label_zh' => '电子邮件',
            'label_ms' => 'Emel',
            'value' => 'info@example.com',
        ]);

        ContactMap::create([
            'map_iframe_url' => '<iframe src="https://maps.google.com/?q=Johor+Bahru" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
        ]);
    }
}
