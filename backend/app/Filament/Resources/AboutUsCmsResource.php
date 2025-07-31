<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AboutUsCmsResource\Pages;
use App\Models\AboutUsCms;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Resources\Resource;

class AboutUsCmsResource extends Resource
{
    protected static ?string $model = AboutUsCms::class;

    protected static ?string $navigationIcon = 'heroicon-o-information-circle';
    protected static ?string $navigationLabel = 'About Us CMS';
    protected static ?string $slug = 'about-us';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Hero Section')
                ->schema([
                    Grid::make(3)->schema([
                        TextInput::make('hero_title_en')->label('Title (EN)'),
                        TextInput::make('hero_title_zh')->label('Title (ZH)'),
                        TextInput::make('hero_title_ms')->label('Title (MS)'),
                    ]),
                    Grid::make(3)->schema([
                        Textarea::make('hero_description_en')->label('Description (EN)'),
                        Textarea::make('hero_description_zh')->label('Description (ZH)'),
                        Textarea::make('hero_description_ms')->label('Description (MS)'),
                    ]),
                ])->collapsible(),

            Section::make('Story Section')
                ->schema([
                    FileUpload::make('story_image')->image()->columnSpanFull(),
                    Grid::make(3)->schema([
                        TextInput::make('story_title_en')->label('Title (EN)'),
                        TextInput::make('story_title_zh')->label('Title (ZH)'),
                        TextInput::make('story_title_ms')->label('Title (MS)'),
                    ]),
                    Grid::make(3)->schema([
                        Textarea::make('story_description_en')->label('Description (EN)'),
                        Textarea::make('story_description_zh')->label('Description (ZH)'),
                        Textarea::make('story_description_ms')->label('Description (MS)'),
                    ]),
                ])->collapsible(),

            Section::make('Achievements')
                ->schema([
                    Repeater::make('achievements')
                        ->schema([
                            FileUpload::make('icon')->image()->label('Icon'),
                            TextInput::make('value')->label('Value'),
                            TextInput::make('label_en')->label('Label (EN)'),
                            TextInput::make('label_zh')->label('Label (ZH)'),
                            TextInput::make('label_ms')->label('Label (MS)'),
                        ])->columns(2)->collapsible(),
                ])->collapsible(),

            Section::make('Our Teams')
                ->schema([
                    Repeater::make('our_teams')
                        ->schema([
                            FileUpload::make('image')->image()->label('Image'),
                            TextInput::make('name')->label('Name'),
                            TextInput::make('position_en')->label('Position (EN)'),
                            TextInput::make('position_zh')->label('Position (ZH)'),
                            TextInput::make('position_ms')->label('Position (MS)'),
                            Textarea::make('description_en')->label('Description (EN)')->columnSpanFull(),
                            Textarea::make('description_zh')->label('Description (ZH)')->columnSpanFull(),
                            Textarea::make('description_ms')->label('Description (MS)')->columnSpanFull(),
                        ])->columns(2)->collapsible(),
                ])->collapsible(),

            Section::make('Our Values')
                ->schema([
                    Repeater::make('our_values')
                        ->schema([
                            FileUpload::make('icon')->image()->label('Icon'),
                            TextInput::make('title_en')->label('Title (EN)'),
                            TextInput::make('title_zh')->label('Title (ZH)'),
                            TextInput::make('title_ms')->label('Title (MS)'),
                            Textarea::make('description_en')->label('Description (EN)')->columnSpanFull(),
                            Textarea::make('description_zh')->label('Description (ZH)')->columnSpanFull(),
                            Textarea::make('description_ms')->label('Description (MS)')->columnSpanFull(),
                        ])->columns(2)->collapsible(),
                ])->collapsible(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAboutUsCms::route('/'),
            'create' => Pages\CreateAboutUsCms::route('/create'),
            'edit' => Pages\EditAboutUsCms::route('/{record}/edit'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return true;
    }
}
