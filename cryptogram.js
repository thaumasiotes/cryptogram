cg = {

    // options
    alpha_only: true,
    case_insensitive: true,

    freq_count: new Map(),
    mapping: new Map(),

    // Re-layout everything. This gets called to refresh
    // the page, anytime anything happens.
    handle_ciphertext: function() {
        // process for character frequency
        let ciphertext =
            document.querySelector('#cg_ciphertext > textarea').value;
        let ct_lines = ciphertext.trim().split('\n');
        this.count_frequencies(ct_lines);
        // display sorted list of characters
        this.show_mapping();
        // apply character mapping, if present
        // display plaintext
        this.show_plaintext(ct_lines);
    },

    // For every character in the ciphertext, determine
    // how many times it occurs. The results are stored
    // in cg.freq_count . Counting is affected by the
    // `case_insensitive` and `alpha_only` options.
    count_frequencies: function(lines) {
        this.freq_count.clear();
        this.freq_count.total_chars = 0;
        for(const line of lines) {
            for(let chr of line) {
                if(this.case_insensitive) {
                    chr = chr.toUpperCase();
                }
                if( this.alpha_only && (/[^A-Z]/i.test(chr)) ) {
                    continue;
                }
                let count = this.freq_count.get(chr) || 0;
                this.freq_count.set(chr, count + 1);
                this.freq_count.total_chars += 1;
            }
        }
    },

    // Lay out the table of character frequencies in the center pane.
    // This also lays out the controls which allow updating the
    // decryption key, a map from ciphertext glyph to plaintext glyph.
    show_mapping: function() {
        let chars = Array.from(this.freq_count.keys());
        chars.sort( (a,b) => this.freq_count.get(b) - this.freq_count.get(a) );

        let map_panel = document.createElement('span');
        map_panel.setAttribute('class', 'cg_map_grid');
        for(const chr of chars) {
            let ct_glyph = document.createElement('span');
            ct_glyph.appendChild( document.createTextNode(chr) );

            let frequency = document.createElement('span');
            let percentage =
                this.freq_count.get(chr) / this.freq_count.total_chars;
            percentage = (percentage * 100).toFixed(2);
            frequency.appendChild( document.createTextNode(percentage) );

            let pt_glyph = document.createElement('input');
            if( this.mapping.has(chr) ) {
                pt_glyph.value = this.mapping.get(chr);
            }
            pt_glyph.onfocus = ( (e) => e.target.select() );
            pt_glyph.oninput = ( () => {
                if(pt_glyph.value) {
                    pt_glyph.value = pt_glyph.value[0];
                    this.mapping.set(chr, pt_glyph.value);
                } else {
                    this.mapping.delete(chr);
                }
                this.handle_ciphertext();
            } );

            map_panel.appendChild(ct_glyph);
            map_panel.appendChild(frequency);
            map_panel.appendChild(pt_glyph);
        }
        let old_map_panel = document.querySelector('#cg_map > .cg_map_grid');
        old_map_panel.replaceWith(map_panel);
    },

    // Given an array of ciphertext lines, return an array of lines
    // transformed by the decryption key.
    // This is currently unused, since it made it difficult to render
    // ciphertext and plaintext in different colors in the result.
    apply_mapping: function(ct_lines) {
        let pt_lines = [];
        for(const ct_line of ct_lines) {
            let pt_line = "";
            for(const chr of ct_line) {
                let normalized_chr = chr;
                if(this.case_insensitive) {
                    normalized_chr = chr.toUpperCase();
                }
                if(this.alpha_only) {
                    /* If this.mapping has a leftover mapping for a
                       non-alphabetic character, we need to ignore that. */
                    if( /[^A-Z]/i.test(chr) ) {
                        pt_line += chr;
                        continue;
                    }
                }

                let pt_chr = this.mapping.get(normalized_chr) || chr;
                if(this.case_insensitive) {
                    if( /[a-z]/.test(chr) ) {
                        pt_chr = pt_chr.toLowerCase();
                    }
                    if( /[A-Z]/.test(chr) ) {
                        pt_chr = pt_chr.toUpperCase();
                    }
                }
                pt_line += pt_chr;
            }
            pt_lines.push(pt_line);
        }
        return pt_lines;
    },

    // Given an array of ciphertext lines, assemble a DOM structure
    // to display the decrypted plaintext. Characters for which the
    // decryption is not known appear, but in a faded color.
    show_plaintext: function(lines) {
        let span = document.createElement('span');
        let para = document.createElement('p');
        let add_line_break = false;
        for(const line of lines) {
            // treat double newline as paragraph break
            if( line.length == 0 ) {
                span.appendChild(para);
                para = document.createElement('p');
                add_line_break = false;
                continue;
            }

            if( add_line_break ) {
                para.appendChild( document.createElement('br') );
            }

            let chunk = "";
            let plaintext_mode = false;
            let color_span = 0;
            for(const chr of line) {
                let normalized_chr = chr;
                if(this.case_insensitive)
                    { normalized_chr = chr.toUpperCase(); }
                if( this.alpha_only && /[^a-z]/i.test(chr) ) {
                    // If there is a leftover mapping for a
                    // non-alphabetic character, ignore it.
                    this.mapping.delete(chr);
                }

                if( !this.mapping.has(normalized_chr) ) {
                    if(plaintext_mode) {
                        color_span.appendChild(document.createTextNode(chunk));
                        para.appendChild(color_span);
                        chunk = chr;
                        plaintext_mode = false;
                    } else {
                        chunk += chr;
                    }
                } else { // this.mapping.has(normalized_chr)
                    let mapped_chr = this.mapping.get(normalized_chr);
                    if(this.case_insensitive) {
                        if( /[a-z]/.test(chr) )
                            { mapped_chr = mapped_chr.toLowerCase(); }
                        if( /[A-Z]/.test(chr) )
                            { mapped_chr = mapped_chr.toUpperCase(); }
                    }

                    if(plaintext_mode) {
                        chunk += mapped_chr;
                    } else {
                        para.appendChild( document.createTextNode(chunk) );
                        chunk = mapped_chr;
                        plaintext_mode = true;
                        color_span = document.createElement('span');
                        color_span.setAttribute('class','cg_deciphered');
                    }
                }
            } // loop doesn't add the final chunk
            if(plaintext_mode) {
                color_span.appendChild(document.createTextNode(chunk));
                para.appendChild(color_span);
            } else {
                para.appendChild( document.createTextNode(chunk) );
            }
            add_line_break = true;
        } // loop doesn't add the final paragraph
        span.appendChild(para);

        document.querySelector('#cg_plaintext > span').replaceWith(span);
    },

    // Handle the "alphabetic only" checkbox
    toggle_alpha_only: function() {
        let alpha_only_checkbox =
            document.getElementById('cg_alpha_only');
        this.alpha_only = alpha_only_checkbox.checked;
        this.handle_ciphertext();
    },

    // Handle the "case-insensitive" checkbox
    toggle_case_insensitive: function() {
        let case_insensitive_checkbox =
            document.getElementById('cg_case_insensitive');
        this.case_insensitive = case_insensitive_checkbox.checked;
        this.handle_ciphertext();
    },

    // Handle the reset button. This wipes the decryption key.
    reset_key: function() {
        this.mapping.clear();
        this.handle_ciphertext();
    },

    // Handle the ROT13 button. This sets the decryption key
    // to a ROT13 map.
    rot13: function() {
        this.mapping.clear();
        let a = 'a'.charCodeAt(0);
        for(let offset = 0; offset < 26; offset++) {
            let code = (offset + 13) % 26;
            let old_chr = String.fromCharCode(a + offset);
            let new_chr = String.fromCharCode(a + code);
            this.mapping.set(old_chr, new_chr);
            this.mapping.set(old_chr.toUpperCase(), new_chr.toUpperCase());
        }
        this.handle_ciphertext();
    },

}
