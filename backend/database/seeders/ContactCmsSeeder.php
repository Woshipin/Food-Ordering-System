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

        // 1. Phone
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

        // 2. Email
        ContactInfo::create([
            'type' => 'email',
            'label_en' => 'Email',
            'label_zh' => '电子邮件',
            'label_ms' => 'Emel',
            'value' => 'info@example.com',
            'note_en' => 'Feel free to email us',
            'note_zh' => '欢迎发送邮件给我们',
            'note_ms' => 'Sila emel kepada kami',
        ]);

        // 3. Address
        ContactInfo::create([
            'type' => 'address',
            'label_en' => 'Mid Valley Southkey',
            'label_zh' => 'Mid Valley Southkey',
            'label_ms' => 'Mid Valley Southkey',
            'value' => '1, Persiaran Southkey 1, Southkey, 80150 Johor Bahru, Johor Darul Tazim',
            'longitude' => '103.77657650',
            'latitude' => '1.50235030',
            'note_en' => 'Headquarters',
            'note_zh' => '总部地址',
            'note_ms' => 'Ibu Pejabat',
        ]);

        // 4. Hours
        ContactInfo::create([
            'type' => 'hours',
            'label_en' => 'Business Hours',
            'label_zh' => '营业时间',
            'label_ms' => 'Waktu Operasi',
            'value' => 'Mon - Fri, 9:00 AM - 6:00 PM',
            'note_en' => 'Closed on public holidays',
            'note_zh' => '公共假期不营业',
            'note_ms' => 'Tutup pada cuti umum',
        ]);

        ContactMap::create([
            'map_iframe_url' => '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.389126124463!2d103.67928727472494!3d1.5336266984520133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da73c109632e0b%3A0x74cda51bf210c304!2z5Y2X5pa55aSn5a2m5a2m6Zmi!5e0!3m2!1szh-CN!2smy!4v1754545943329!5m2!1szh-CN!2smy" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
        ]);
    }
}
