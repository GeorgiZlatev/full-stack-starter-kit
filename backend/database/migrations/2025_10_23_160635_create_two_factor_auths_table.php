<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('two_factor_auths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['email', 'telegram', 'google_authenticator']);
            $table->text('secret')->nullable(); // For Google Authenticator
            $table->string('telegram_chat_id')->nullable(); // For Telegram
            $table->boolean('is_enabled')->default(false);
            $table->json('backup_codes')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('two_factor_auths');
    }
};
